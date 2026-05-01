package com.n11.order_service.saga;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.n11.order_service.dto.payment.PaymentRequest;
import com.n11.order_service.dto.payment.PaymentResponse;
import com.n11.order_service.dto.stock.StockUpdateRequest;
import com.n11.order_service.entity.Order;
import com.n11.order_service.entity.OrderDetails;
import com.n11.order_service.entity.OrderItem;
import com.n11.order_service.entity.OrderStatus;
import com.n11.order_service.repository.OrderRepository;
import com.n11.order_service.service.PaymentServiceClient;
import com.n11.order_service.service.StockServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class OrderSagaListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderSagaListener.class);

    private final OrderRepository orderRepository;
    private final PaymentServiceClient paymentServiceClient;
    private final StockServiceClient stockServiceClient;
    private final PaymentCardStore paymentCardStore;
    private final ObjectMapper objectMapper;

    public OrderSagaListener(OrderRepository orderRepository,
                             PaymentServiceClient paymentServiceClient,
                             StockServiceClient stockServiceClient,
                             PaymentCardStore paymentCardStore,
                             ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.paymentServiceClient = paymentServiceClient;
        this.stockServiceClient = stockServiceClient;
        this.paymentCardStore = paymentCardStore;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @KafkaListener(topics = "stock-reserved", groupId = "order-service-group")
    public void onStockReserved(String payload) {
        try {
            StockReservedEvent event = objectMapper.readValue(payload, StockReservedEvent.class);
            LOGGER.info("[SAGA] StockReservedEvent: orderId={}, username={}", event.getOrderId(), event.getUsername());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.COMPLETED) {
                LOGGER.warn("[SAGA] Order already in final state={}, orderId={}", order.getStatus(), order.getId());
                return;
            }

            order.setStatus(OrderStatus.STOCK_DEDUCTED);
            orderRepository.save(order);

            OrderDetails details = order.getOrderDetails();
            PaymentRequest pr = new PaymentRequest();
            pr.setOrderId(order.getId());
            pr.setUsername(order.getUsername());
            if (details != null) {
                pr.setFirstName(details.getFirstName());
                pr.setLastName(details.getLastName());
                pr.setStreetAddress(details.getStreetAddress());
                pr.setAddress(details.getStreetAddress());
                pr.setEmail(details.getEmail());
            }
            pr.setAmount(order.getTotalPrice());
            pr.setPaymentMethod("IYZICO");

            PaymentRequest.Card storedCard = paymentCardStore.take(order.getId());
            if (storedCard == null) {
                LOGGER.warn("[SAGA] Card not found in store, orderId={}", order.getId());
                markOrderCancelledAndCompensateStock(order);
                return;
            }
            pr.setCard(storedCard);

            List<PaymentRequest.Item> payItems = new ArrayList<>();
            for (OrderItem it : order.getItems()) {
                PaymentRequest.Item pi = new PaymentRequest.Item();
                pi.setProductId(it.getProductId());
                pi.setProductName(it.getProductName());
                pi.setPrice(it.getPrice());
                pi.setQuantity(it.getQuantity());
                payItems.add(pi);
            }
            pr.setItems(payItems);

            PaymentResponse resp;
            try {
                resp = paymentServiceClient.makePayment(pr);
            } catch (Exception ex) {
                LOGGER.error("[SAGA] Payment service error, orderId={}", order.getId(), ex);
                markOrderCancelledAndCompensateStock(order);
                return;
            }

            if (resp == null || !resp.isSuccess()) {
                LOGGER.warn("[SAGA] Payment failed, orderId={}", order.getId());
                markOrderCancelledAndCompensateStock(order);
                return;
            }

            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
            LOGGER.info("[SAGA] Order COMPLETED: orderId={}", order.getId());

        } catch (Exception e) {
            LOGGER.error("[SAGA] onStockReserved processing error", e);
        }
    }

    @Transactional
    @KafkaListener(topics = "stock-rejected", groupId = "order-service-group")
    public void onStockRejected(String payload) {
        try {
            StockRejectedEvent event = objectMapper.readValue(payload, StockRejectedEvent.class);
            LOGGER.info("[SAGA] StockRejectedEvent: orderId={}, reason={}", event.getOrderId(), event.getMessage());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            LOGGER.info("[SAGA] Order CANCELLED (stock rejected): orderId={}", order.getId());

        } catch (Exception e) {
            LOGGER.error("[SAGA] onStockRejected processing error", e);
        }
    }

    private void markOrderCancelledAndCompensateStock(Order order) {
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        try {
            StockUpdateRequest req = new StockUpdateRequest();
            List<StockUpdateRequest.StockItem> items = new ArrayList<>();
            for (OrderItem it : order.getItems()) {
                StockUpdateRequest.StockItem si = new StockUpdateRequest.StockItem();
                si.setProductId(it.getProductId());
                si.setQuantity(it.getQuantity());
                items.add(si);
            }
            req.setItems(items);
            stockServiceClient.releaseStock(req);
            LOGGER.info("[SAGA] Stock released for orderId={}", order.getId());
        } catch (Exception ex) {
            LOGGER.error("[SAGA] Stock release failed for orderId={}", order.getId(), ex);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StockReservedEvent {
        private Long orderId;
        private String username;
        private String message;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StockRejectedEvent {
        private Long orderId;
        private String username;

        @JsonAlias("reason")
        private String message;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
