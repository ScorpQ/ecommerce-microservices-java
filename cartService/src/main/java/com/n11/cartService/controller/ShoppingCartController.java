package com.n11.cartService.controller;

import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.dto.response.ShoppingCartResponse;
import com.n11.cartService.service.ShoppingCartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/shopping-cart")
public class ShoppingCartController {

    private final ShoppingCartService shoppingCartService;

    public ShoppingCartController(ShoppingCartService shoppingCartService) {
        this.shoppingCartService = shoppingCartService;
    }

    @GetMapping
    public ResponseEntity<ShoppingCartResponse> getCart(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(shoppingCartService.getOrCreateCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<ShoppingCartResponse> addItem(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddItemRequest request
    ) {
        return ResponseEntity.ok(shoppingCartService.addItem(userId, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ShoppingCartResponse> updateQuantity(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(shoppingCartService.updateQuantity(userId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ShoppingCartResponse> removeItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(shoppingCartService.removeItem(userId, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("X-User-Id") Long userId
    ) {
        shoppingCartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Long>> getTotalPrice(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(shoppingCartService.getTotalPrice(userId));
    }
}
