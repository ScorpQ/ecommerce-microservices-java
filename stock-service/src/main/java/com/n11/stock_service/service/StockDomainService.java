package com.n11.stock_service.service;


import com.n11.stock_service.dto.StockResponse;
import com.n11.stock_service.dto.StockUpdateRequest;
import com.n11.stock_service.dto.StockUpdateResponse;
import com.n11.stock_service.entity.StockEntity;
import com.n11.stock_service.repository.ProductStockRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class StockDomainService {

    private final ProductStockRepository repo;

    public StockDomainService(ProductStockRepository repo) {
        this.repo = repo;
    }

    public StockResponse getByProductId(Long productId) {
        StockEntity entity = repo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        return StockResponse.from(entity);
    }

    @Transactional
    public StockUpdateResponse decrease(StockUpdateRequest req) {
        try {
            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + it.getProductId()));
                if (ps.getAvailableQuantity() < it.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for productId=" + it.getProductId());
                }
            }

            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId()).orElseThrow();
                ps.decrease(it.getQuantity());
                repo.save(ps);
            }

            return StockUpdateResponse.ok("Stock decreased");
        } catch (Exception e) {
            return StockUpdateResponse.fail(e.getMessage());
        }
    }

    @Transactional
    public StockUpdateResponse increase(StockUpdateRequest req) {
        try {
            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + it.getProductId()));
                ps.increase(it.getQuantity());
                repo.save(ps);
            }

            return StockUpdateResponse.ok("Stock increased");
        } catch (Exception e) {
            return StockUpdateResponse.fail(e.getMessage());
        }
    }

    @Transactional
    public StockUpdateResponse reserve(StockUpdateRequest req) {
        try {
            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + it.getProductId()));

                if (ps.getAvailableQuantity() < it.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for productId=" + it.getProductId());
                }
            }

            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId()).orElseThrow();
                ps.reserve(it.getQuantity());
                repo.save(ps);
            }

            return StockUpdateResponse.ok("Stock reserved");
        } catch (Exception e) {
            return StockUpdateResponse.fail(e.getMessage());
        }
    }

    @Transactional
    public StockUpdateResponse release(StockUpdateRequest req) {
        try {
            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + it.getProductId()));

                if (ps.getReservedQuantity() < it.getQuantity()) {
                    throw new IllegalStateException("Insufficient reserved stock for productId=" + it.getProductId());
                }
            }

            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId()).orElseThrow();
                ps.release(it.getQuantity());
                repo.save(ps);
            }

            return StockUpdateResponse.ok("Stock released");
        } catch (Exception e) {
            return StockUpdateResponse.fail(e.getMessage());
        }
    }

    @Transactional
    public StockUpdateResponse commit(StockUpdateRequest req) {
        try {
            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + it.getProductId()));

                if (ps.getReservedQuantity() < it.getQuantity()) {
                    throw new IllegalStateException("Insufficient reserved stock for productId=" + it.getProductId());
                }
            }

            for (StockUpdateRequest.StockItem it : req.getItems()) {
                StockEntity ps = repo.findById(it.getProductId()).orElseThrow();
                ps.commit(it.getQuantity());
                repo.save(ps);
            }

            return StockUpdateResponse.ok("Stock committed");
        } catch (Exception e) {
            return StockUpdateResponse.fail(e.getMessage());
        }
    }
}