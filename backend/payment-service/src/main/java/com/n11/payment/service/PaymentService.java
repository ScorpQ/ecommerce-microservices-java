package com.n11.payment.service;

import com.n11.payment.dto.PaymentRequest;
import com.n11.payment.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse pay(PaymentRequest request);
}
