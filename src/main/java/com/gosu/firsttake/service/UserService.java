package com.gosu.firsttake.service;

import com.gosu.firsttake.api.dto.UserDtos;
import com.gosu.firsttake.config.SecurityMode;
import com.gosu.firsttake.config.SecurityProperties;
import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.CoinTransaction;
import com.gosu.firsttake.domain.CoinTransactionType;
import com.gosu.firsttake.domain.GeneratedAsset;
import com.gosu.firsttake.repository.CoinTransactionRepository;
import com.gosu.firsttake.repository.GeneratedAssetRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final CurrentUserService currentUserService;
    private final CoinTransactionRepository coinTransactionRepository;
    private final GeneratedAssetRepository generatedAssetRepository;
    private final SecurityProperties securityProperties;

    public UserService(
        CurrentUserService currentUserService,
        CoinTransactionRepository coinTransactionRepository,
        GeneratedAssetRepository generatedAssetRepository,
        SecurityProperties securityProperties
    ) {
        this.currentUserService = currentUserService;
        this.coinTransactionRepository = coinTransactionRepository;
        this.generatedAssetRepository = generatedAssetRepository;
        this.securityProperties = securityProperties;
    }

    @Transactional(readOnly = true)
    public UserDtos.MeResponse getMe() {
        AppUser user = currentUserService.requireCurrentUser();
        return new UserDtos.MeResponse(
            user.getId(),
            user.getEmail(),
            user.isEmailVerified(),
            user.getDisplayName(),
            user.getCoinBalance(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            securityProperties.getMode().name()
        );
    }

    @Transactional(readOnly = true)
    public UserDtos.CoinBalanceResponse getCoinBalance() {
        AppUser user = currentUserService.requireCurrentUser();
        List<CoinTransaction> recent = coinTransactionRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId());
        return new UserDtos.CoinBalanceResponse(
            user.getCoinBalance(),
            recent.stream().map(this::toDto).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<UserDtos.GalleryAsset> getGallery(Optional<String> type, Optional<Long> projectId) {
        AppUser user = currentUserService.requireCurrentUser();
        List<GeneratedAsset> assets;
        if (projectId.isPresent()) {
            if (type.isPresent()) {
                AssetType assetType = AssetType.valueOf(type.get());
                assets = generatedAssetRepository.findByProjectIdAndAssetTypeOrderByCreatedAtDesc(
                    projectId.get(),
                    assetType
                );
            } else {
                assets = generatedAssetRepository.findByProjectIdOrderByCreatedAtDesc(projectId.get());
            }
        } else if (type.isPresent()) {
            AssetType assetType = AssetType.valueOf(type.get());
            assets = generatedAssetRepository.findByCreatedByUserIdAndAssetTypeOrderByCreatedAtDesc(user.getId(), assetType);
        } else {
            assets = generatedAssetRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return assets.stream().map(asset -> new UserDtos.GalleryAsset(
            asset.getId(),
            asset.getProject() != null ? asset.getProject().getId() : null,
            asset.getBeat() != null ? asset.getBeat().getId() : null,
            asset.getAssetType().name(),
            asset.getUrl(),
            asset.getProvider(),
            asset.getMimeType(),
            asset.getDurationSeconds(),
            asset.getOriginalPrompt(),
            asset.getCreatedAt()
        )).toList();
    }

    @Transactional
    public UserDtos.CoinBalanceResponse addCoins(long amount, String reason) {
        if (securityProperties.getMode() != SecurityMode.DEV_DEFAULT_USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Coin adjustments are only available in dev mode.");
        }
        AppUser user = currentUserService.requireCurrentUser();
        user.setCoinBalance(user.getCoinBalance() + amount);
        user.setLastLoginAt(Instant.now());
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUser(user);
        transaction.setType(CoinTransactionType.ADJUSTMENT);
        transaction.setAmount(amount);
        transaction.setReason(reason);
        coinTransactionRepository.save(transaction);
        return getCoinBalance();
    }

    private UserDtos.CoinTransactionDto toDto(CoinTransaction transaction) {
        return new UserDtos.CoinTransactionDto(
            transaction.getId(),
            transaction.getType().name(),
            transaction.getAmount(),
            transaction.getReason(),
            transaction.getRelatedProject() != null ? transaction.getRelatedProject().getId() : null,
            transaction.getRelatedAsset() != null ? transaction.getRelatedAsset().getId() : null,
            transaction.getCreatedAt()
        );
    }
}
