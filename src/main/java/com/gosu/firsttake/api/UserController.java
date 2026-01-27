package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.UserDtos;
import com.gosu.firsttake.service.UserService;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserDtos.MeResponse getMe() {
        return userService.getMe();
    }

    @GetMapping("/coins")
    public UserDtos.CoinBalanceResponse getCoins() {
        return userService.getCoinBalance();
    }

    @PostMapping("/coins/purchase-intent")
    public UserDtos.PurchaseIntentResponse purchaseIntent() {
        return new UserDtos.PurchaseIntentResponse("stub", "Payment integration not configured yet.");
    }

    @PostMapping("/coins/add")
    public UserDtos.CoinBalanceResponse addCoins(@RequestBody AddCoinsRequest request) {
        return userService.addCoins(request.amount(), request.reason());
    }

    @GetMapping("/gallery")
    public List<UserDtos.GalleryAsset> gallery(
        @RequestParam(name = "type", required = false) Optional<String> type,
        @RequestParam(name = "projectId", required = false) Optional<Long> projectId
    ) {
        return userService.getGallery(type, projectId);
    }

    public record AddCoinsRequest(long amount, String reason) {
    }
}
