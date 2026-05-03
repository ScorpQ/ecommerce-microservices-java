package com.n11.stock_service.dto;

import com.n11.stock_service.entity.StockEntity;

public class StockResponse {

    private Long productId;
    private String productName;
    private Integer availableQuantity;
    private Integer reservedQuantity;

    public StockResponse(Long productId, String productName, Integer availableQuantity, Integer reservedQuantity) {
        this.productId = productId;
        this.productName = productName;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = reservedQuantity;
    }

    public static StockResponse from(StockEntity entity) {
        return new StockResponse(
                entity.getProductId(),
                entity.getProductName(),
                entity.getAvailableQuantity(),
                entity.getReservedQuantity()
        );
    }

    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public Integer getAvailableQuantity() { return availableQuantity; }
    public Integer getReservedQuantity() { return reservedQuantity; }
}
