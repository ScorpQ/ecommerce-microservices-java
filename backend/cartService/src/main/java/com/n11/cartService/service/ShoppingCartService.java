package com.n11.cartService.service;

import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.dto.response.ShoppingCartResponse;

import java.util.Map;

public interface ShoppingCartService {
    ShoppingCartResponse getOrCreateCart(String username);
    ShoppingCartResponse addItem(String username, AddItemRequest request);
    ShoppingCartResponse removeItem(String username, Long productId);
    ShoppingCartResponse updateQuantity(String username, Long productId, Integer quantity);
    void clearCart(String username);
    Map<String, Long> getTotalPrice(String username);
}
