package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GeneratedAssetRepository extends JpaRepository<GeneratedAsset, Long> {
    List<GeneratedAsset> findByBeatIdIn(Collection<Long> beatIds);
    List<GeneratedAsset> findByProjectIdAndAssetTypeOrderByCreatedAtDesc(Long projectId, AssetType assetType);
    List<GeneratedAsset> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<GeneratedAsset> findByCreatedByUserIdAndAssetTypeOrderByCreatedAtDesc(Long userId, AssetType assetType);
    List<GeneratedAsset> findByCreatedByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByBeatId(Long beatId);
    void deleteByBeatIdAndAssetType(Long beatId, AssetType assetType);
}
