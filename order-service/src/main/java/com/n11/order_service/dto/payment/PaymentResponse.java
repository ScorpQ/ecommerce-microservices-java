package com.n11.order_service.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentResponse {
    private boolean success;
    private String transactionId;
    private String message;
}