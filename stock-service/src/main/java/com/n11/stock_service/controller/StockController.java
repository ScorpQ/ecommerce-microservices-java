package com.n11.stock_service.controller;

import com.n11.stock_service.dto.StockUpdateRequest;
import com.n11.stock_service.dto.StockUpdateResponse;
import com.n11.stock_service.entity.StockEntity;
import com.n11.stock_service.service.StockDomainService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockDomainService stock;

    public StockController(StockDomainService stock) {
        this.stock = stock;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<StockEntity> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(stock.getByProductId(productId));
    }

    @PostMapping("/decrease")
    public ResponseEntity<StockUpdateResponse> decrease(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.decrease(req));
    }

    @PostMapping("/increase")
    public ResponseEntity<StockUpdateResponse> increase(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.increase(req));
    }

    @PostMapping("/reserve")
    public ResponseEntity<StockUpdateResponse> reserve(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.reserve(req));
    }

    @PostMapping("/release")
    public ResponseEntity<StockUpdateResponse> release(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.release(req));
    }

    @PostMapping("/commit")
    public ResponseEntity<StockUpdateResponse> commit(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.commit(req));
    }
}
