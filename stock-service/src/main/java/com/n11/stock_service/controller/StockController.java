package com.n11.stock_service.controller;

import com.n11.stock_service.dto.StockResponse;
import com.n11.stock_service.dto.StockUpdateRequest;
import com.n11.stock_service.dto.StockUpdateResponse;
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

    // done - Stock bilgisini getirmek için kullanılır.
    @GetMapping("/{productId}")
    public ResponseEntity<StockResponse> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(stock.getByProductId(productId));
    }

    // done - ui yok Postman'den göstermelisin
    @PostMapping("/decrease")
    public ResponseEntity<StockUpdateResponse> decrease(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.decrease(req));
    }

    // done - ui yok Postman'den göstermelisin
    @PostMapping("/increase")
    public ResponseEntity<StockUpdateResponse> increase(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.increase(req));
    }

    // done - kafka ile tetiklenecek ayırca stock_db'de bulunan stock tablosunda belirli ürünü
    // reverse sayısını arttırır.
    @PostMapping("/reserve")
    public ResponseEntity<StockUpdateResponse> reserve(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.reserve(req));
    }

    // done - kafka ile tetiklenecek ayırca stock_db'de bulunan stock tablosunda belirli ürünü
    // ödeme başarısız olursa rollback atar.
    @PostMapping("/release")
    public ResponseEntity<StockUpdateResponse> release(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.release(req));
    }

    // done - kafka ile tetiklenecek ayırca stock_db'de bulunan stock tablosunda belirli ürünü
    // ödeme başarılı olursa süreci tamamlar
    @PostMapping("/commit")
    public ResponseEntity<StockUpdateResponse> commit(@RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(stock.commit(req));
    }
}
