package com.n11.order_service.dto.payment;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PaymentRequest {
    private Long orderId;
    private String username;
    private Double amount;
    private String paymentMethod;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String city;
    private String streetAddress;
    private String country;
    private String address;
    private Card card;
    private List<Item> items; // orderdaki ürünleri temsil ediyor

    @Getter
    @Setter
    public static class Card {
        private String cardHolderName;
        private String cardNumber;
        private String expireMonth;
        private String expireYear;
        private String cvc;
    }

    @Getter
    @Setter
    public static class Item {
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private String category1;
        private String category2;
    }
}
