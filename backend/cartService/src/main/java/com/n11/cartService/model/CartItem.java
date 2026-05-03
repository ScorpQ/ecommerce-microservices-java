package com.n11.cartService.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
public class CartItem implements Serializable {
    private Long productId;
    private Integer quantity;
    private Long price;
}
