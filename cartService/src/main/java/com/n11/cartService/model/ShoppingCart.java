package com.n11.cartService.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ShoppingCart implements Serializable {
    private Long userId;
    private List<CartItem> items = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
}
