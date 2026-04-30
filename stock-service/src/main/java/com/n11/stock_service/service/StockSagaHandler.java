package com.n11.stock_service.service;

import com.n11.stock_service.dto.KafkaEventPayload;
import com.n11.stock_service.dto.StockUpdateRequest;
import com.n11.stock_service.dto.StockUpdateResponse;
import jakarta.transaction.Transactional;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class StockSagaHandler {

    private final StockDomainService stock;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public StockSagaHandler(StockDomainService stock, KafkaTemplate<String, Object> kafkaTemplate) {
        this.stock = stock;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    @KafkaListener(topics = "stock-reserve-requested", groupId = "stock-service-group")
    public void handleReserveRequested(KafkaEventPayload.StockReserveRequestedEvent event) {
        StockUpdateRequest req = new StockUpdateRequest(
                event.getItems().stream()
                        .map(i -> new StockUpdateRequest.StockItem(i.getProductId(), i.getQuantity()))
                        .collect(Collectors.toList())
        );

        StockUpdateResponse resp = stock.reserve(req);

        if (resp.isSuccess()) {
            kafkaTemplate.send("stock-reserved",
                    new KafkaEventPayload.StockReservedEvent(event.getOrderId(), event.getUsername(), "Stock reserved"));
        } else {
            kafkaTemplate.send("stock-rejected",
                    new KafkaEventPayload.StockRejectedEvent(event.getOrderId(), event.getUsername(), resp.getMessage()));
        }
    }
}
