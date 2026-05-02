package com.n11.payment.service.impl;

import com.iyzipay.Options;
import com.iyzipay.model.*;
import com.iyzipay.request.CreatePaymentRequest;
import com.n11.payment.dto.PaymentRequest;
import com.n11.payment.dto.PaymentResponse;
import com.n11.payment.entity.PaymentRecord;
import com.n11.payment.repository.PaymentRepository;
import com.n11.payment.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final Options iyzicoOptions;

    public PaymentServiceImpl(PaymentRepository paymentRepository, Options iyzicoOptions) {
        this.paymentRepository = paymentRepository;
        this.iyzicoOptions = iyzicoOptions;
    }

    @Override
    public PaymentResponse pay(PaymentRequest request) {
        PaymentRecord record = new PaymentRecord();
        record.setOrderId(request.getOrderId());
        record.setUsername(request.getUsername());
        record.setAmount(request.getAmount());

        try {
            CreatePaymentRequest iyzicoRequest = buildIyzicoRequest(request);
            Payment payment = Payment.create(iyzicoRequest, iyzicoOptions);

            LOGGER.info("Iyzico response: status={}, errorCode={}, errorMessage={}",
                    payment.getStatus(), payment.getErrorCode(), payment.getErrorMessage());

            if ("success".equals(payment.getStatus())) {
                record.setStatus("SUCCESS");
                record.setTransactionId(payment.getPaymentId());
                record.setMessage("Payment successful");
                paymentRepository.save(record);
                return new PaymentResponse(true, payment.getPaymentId(), "Payment successful");
            } else {
                record.setStatus("FAILED");
                record.setMessage(payment.getErrorMessage());
                paymentRepository.save(record);
                return new PaymentResponse(false, null, payment.getErrorMessage());
            }

        } catch (Exception e) {
            LOGGER.error("Payment error for orderId={}", request.getOrderId(), e);
            record.setStatus("ERROR");
            record.setMessage(e.getMessage());
            paymentRepository.save(record);
            return new PaymentResponse(false, null, "Payment processing error: " + e.getMessage());
        }
    }

    private CreatePaymentRequest buildIyzicoRequest(PaymentRequest request) {
        CreatePaymentRequest iyzicoRequest = new CreatePaymentRequest();
        iyzicoRequest.setLocale(Locale.TR.getValue());
        iyzicoRequest.setConversationId(String.valueOf(request.getOrderId()));

        BigDecimal amount = BigDecimal.valueOf(request.getAmount()).setScale(2, RoundingMode.HALF_UP);
        iyzicoRequest.setPrice(amount);
        iyzicoRequest.setPaidPrice(amount);
        iyzicoRequest.setCurrency(Currency.TRY.name());
        iyzicoRequest.setInstallment(1);
        iyzicoRequest.setBasketId("ORDER-" + request.getOrderId());
        iyzicoRequest.setPaymentChannel(PaymentChannel.WEB.name());
        iyzicoRequest.setPaymentGroup(PaymentGroup.PRODUCT.name());

        PaymentCard paymentCard = new PaymentCard();
        paymentCard.setCardHolderName(request.getCard().getCardHolderName());
        paymentCard.setCardNumber(request.getCard().getCardNumber());
        paymentCard.setExpireMonth(request.getCard().getExpireMonth());
        paymentCard.setExpireYear(request.getCard().getExpireYear());
        paymentCard.setCvc(request.getCard().getCvc());
        paymentCard.setRegisterCard(0);
        iyzicoRequest.setPaymentCard(paymentCard);

        Buyer buyer = new Buyer();
        buyer.setId(request.getUsername());
        buyer.setName(request.getFirstName());
        buyer.setSurname(request.getLastName());
        buyer.setEmail(request.getEmail());
        buyer.setIdentityNumber("74300864791");
        buyer.setRegistrationAddress(request.getStreetAddress());
        buyer.setCity(request.getCity());
        buyer.setCountry(request.getCountry());
        buyer.setIp("85.34.78.112");
        iyzicoRequest.setBuyer(buyer);

        Address shippingAddress = new Address();
        shippingAddress.setContactName(request.getFirstName() + " " + request.getLastName());
        shippingAddress.setCity(request.getCity());
        shippingAddress.setCountry(request.getCountry());
        shippingAddress.setAddress(request.getStreetAddress());
        iyzicoRequest.setShippingAddress(shippingAddress);

        Address billingAddress = new Address();
        billingAddress.setContactName(request.getFirstName() + " " + request.getLastName());
        billingAddress.setCity(request.getCity());
        billingAddress.setCountry(request.getCountry());
        billingAddress.setAddress(request.getStreetAddress());
        iyzicoRequest.setBillingAddress(billingAddress);

        List<BasketItem> basketItems = new ArrayList<>();
        if (request.getItems() != null) {
            for (PaymentRequest.Item item : request.getItems()) {
                BasketItem basketItem = new BasketItem();
                basketItem.setId("ITEM-" + item.getProductId());
                basketItem.setName(item.getProductName());
                basketItem.setCategory1(item.getCategory1() != null ? item.getCategory1() : "Genel");
                basketItem.setItemType(BasketItemType.PHYSICAL.name());
                basketItem.setPrice(BigDecimal.valueOf(item.getPrice() * item.getQuantity())
                        .setScale(2, RoundingMode.HALF_UP));
                basketItems.add(basketItem);
            }
        }
        iyzicoRequest.setBasketItems(basketItems);

        return iyzicoRequest;
    }
}
