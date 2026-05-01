package com.n11.order_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {
    private String username;
    private List<OrderItemDto> items;
    private String firstName;
    private String lastName;
    private String streetAddress;
    private String city;
    private String country;
    private String phone;
    private String email;
    private Card card;
    private String paymentMethod; // Örn: "IYZICO"

    @Getter
    @Setter
    public static class OrderItemDto {
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
    }

    @Getter
    @Setter
    public static class Card {
        private String cardHolderName;
        private String cardNumber;
        private String expireMonth;
        private String expireYear;
        private String cvc;
    }
}