package com.n11.order_service.dto.stock;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class StockReserveRequestedEvent implements Serializable {

    private Long orderId;
    private String username;
    private List<Item> items;


    @Getter
    @Setter
    public static class Item implements Serializable {
        private Long productId;
        private Integer quantity;

        public Item() {
        }

        public Item(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }
    }
}