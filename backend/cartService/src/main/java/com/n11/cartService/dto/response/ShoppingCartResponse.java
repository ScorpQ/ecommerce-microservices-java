package com.n11.cartService.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ShoppingCartResponse {
    private String username;
    private List<CartItemResponse> items;
    private LocalDateTime createdAt;
}
