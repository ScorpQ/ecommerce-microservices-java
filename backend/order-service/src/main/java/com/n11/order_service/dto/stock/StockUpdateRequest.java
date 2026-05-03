package com.n11.order_service.dto.stock;


import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StockUpdateRequest {
    private List<StockItem> items;

    @Getter
    @Setter
    public static class StockItem {
        private Long productId;
        private Integer quantity;

    }
}