package com.n11.stock_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.n11.stock_service.dto.KafkaEventPayload;
import com.n11.stock_service.dto.StockUpdateRequest;
import com.n11.stock_service.dto.StockUpdateResponse;
import com.n11.stock_service.entity.StockEntity;
import com.n11.stock_service.repository.ProductStockRepository;
import jakarta.transaction.Transactional;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class StockSagaHandler {

    private final StockDomainService stock;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ProductStockRepository stockRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StockSagaHandler(StockDomainService stock, KafkaTemplate<String, Object> kafkaTemplate, ProductStockRepository stockRepository) {
        this.stock = stock;
        this.kafkaTemplate = kafkaTemplate;
        this.stockRepository = stockRepository;
    }

    @Transactional
    @KafkaListener(topics = "product-created", groupId = "stock-service-group", containerFactory = "stringKafkaListenerContainerFactory")
    public void handleProductCreated(String payload) {
        try {
            var node = objectMapper.readTree(payload);
            Long productId = node.get("productId").asLong();
            String productName = node.get("productName").asText();
            if (!stockRepository.existsById(productId)) {
                stockRepository.save(new StockEntity(productId, productName, 1));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to handle product-created event", e);
        }
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
