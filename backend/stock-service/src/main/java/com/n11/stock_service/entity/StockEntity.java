package com.n11.stock_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_products")
public class StockEntity {

    @Id
    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    public StockEntity() {}

    public StockEntity(Long productId, String productName, Integer availableQuantity) {
        this.productId = productId;
        this.productName = productName;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = 0;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public void decrease(int q) {
        validatePositiveOrZero(q);

        if (availableQuantity < q) {
            throw new IllegalStateException("Insufficient stock");
        }

        availableQuantity -= q;
    }

    public void increase(int q) {
        validatePositiveOrZero(q);
        availableQuantity += q;
    }

    public void reserve(int q) {
        validatePositiveOrZero(q);

        if (availableQuantity < q) {
            throw new IllegalStateException("Insufficient stock");
        }

        availableQuantity -= q;
        reservedQuantity += q;
    }

    public void release(int q) {
        validatePositiveOrZero(q);

        if (reservedQuantity < q) {
            throw new IllegalStateException("Insufficient reserved stock");
        }

        reservedQuantity -= q;
        availableQuantity += q;
    }

    public void commit(int q) {
        validatePositiveOrZero(q);

        if (reservedQuantity < q) {
            throw new IllegalStateException("Insufficient reserved stock");
        }

        reservedQuantity -= q;
    }

    private void validatePositiveOrZero(int q) {
        if (q < 0) {
            throw new IllegalArgumentException("q<0");
        }
    }
}
