package com.n11.cartService.exception;

public class CartNotFoundException extends RuntimeException {
    public CartNotFoundException(Long userId) {
        super("Cart not found for userId: " + userId);
    }
}
