package com.n11.order_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private Long orderId;
    private String username;
    private Double totalPrice;
    private String status;
    private List<OrderItemResponse> items;

    @Getter
    @Setter
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
    }
}