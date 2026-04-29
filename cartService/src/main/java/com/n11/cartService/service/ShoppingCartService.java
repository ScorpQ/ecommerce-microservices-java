package com.n11.cartService.service;

import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.dto.response.ShoppingCartResponse;

import java.util.Map;

public interface ShoppingCartService {
    ShoppingCartResponse getOrCreateCart(Long userId);
    ShoppingCartResponse addItem(Long userId, AddItemRequest request);
    ShoppingCartResponse removeItem(Long userId, Long productId);
    ShoppingCartResponse updateQuantity(Long userId, Long productId, Integer quantity);
    void clearCart(Long userId);
    Map<String, Long> getTotalPrice(Long userId);
}
