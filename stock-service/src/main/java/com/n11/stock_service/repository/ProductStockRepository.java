package com.n11.stock_service.repository;

import com.n11.stock_service.entity.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductStockRepository extends JpaRepository<StockEntity, Long> { }