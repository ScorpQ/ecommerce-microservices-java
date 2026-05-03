package com.n11.cartService.exception;

public class CartNotFoundException extends RuntimeException {
    public CartNotFoundException(String username) {
        super("Cart not found for user: " + username);
    }
}
