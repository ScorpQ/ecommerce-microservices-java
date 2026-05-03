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
            @RequestHeader("X-User-Username") String username
    ) {
        return ResponseEntity.ok(shoppingCartService.getOrCreateCart(username));
    }

    @PostMapping("/items")
    public ResponseEntity<ShoppingCartResponse> addItem(
            @RequestHeader("X-User-Username") String username,
            @RequestBody AddItemRequest request
    ) {
        return ResponseEntity.ok(shoppingCartService.addItem(username, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ShoppingCartResponse> updateQuantity(
            @RequestHeader("X-User-Username") String username,
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(shoppingCartService.updateQuantity(username, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ShoppingCartResponse> removeItem(
            @RequestHeader("X-User-Username") String username,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(shoppingCartService.removeItem(username, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("X-User-Username") String username
    ) {
        shoppingCartService.clearCart(username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Long>> getTotalPrice(
            @RequestHeader("X-User-Username") String username
    ) {
        return ResponseEntity.ok(shoppingCartService.getTotalPrice(username));
    }
}
