package com.n11.order_service.dto.stock;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StockUpdateResponse {
    private boolean success;
    private String message;
    private List<StockItemResult> results;

    @Getter
    @Setter
    public static class StockItemResult {
        private Long productId;
        private Integer oldQuantity;
        private Integer newQuantity;
    }
}