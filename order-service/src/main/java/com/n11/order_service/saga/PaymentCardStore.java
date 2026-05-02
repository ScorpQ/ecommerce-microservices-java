package com.n11.order_service.saga;


import com.n11.order_service.dto.payment.PaymentRequest;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class PaymentCardStore {

    private final ConcurrentMap<Long, PaymentRequest.Card> store = new ConcurrentHashMap<>();

    public void put(Long orderId, PaymentRequest.Card card) {
        if (orderId == null || card == null) return;
        PaymentRequest.Card copy = new PaymentRequest.Card();
        copy.setCardHolderName(card.getCardHolderName());
        copy.setCardNumber(card.getCardNumber());
        copy.setExpireMonth(card.getExpireMonth());
        copy.setExpireYear(card.getExpireYear());
        copy.setCvc(card.getCvc());

        store.put(orderId, copy);
    }

    public PaymentRequest.Card take(Long orderId) {
        if (orderId == null) return null;
        return store.remove(orderId);
    }
}