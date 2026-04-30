package com.n11.cartService.mapper;

import com.n11.cartService.dto.response.CartItemResponse;
import com.n11.cartService.dto.response.ShoppingCartResponse;
import com.n11.cartService.model.CartItem;
import com.n11.cartService.model.ShoppingCart;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ShoppingCartMapper {

    public ShoppingCartResponse toResponse(ShoppingCart cart) {
        ShoppingCartResponse response = new ShoppingCartResponse();
        response.setUserId(cart.getUserId());
        response.setCreatedAt(cart.getCreatedAt());
        response.setItems(toItemResponseList(cart.getItems()));
        return response;
    }

    private List<CartItemResponse> toItemResponseList(List<CartItem> items) {
        if (items == null) return List.of();
        return items.stream().map(this::toItemResponse).toList();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setProductId(item.getProductId());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        return response;
    }
}
