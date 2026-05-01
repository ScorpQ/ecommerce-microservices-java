package com.n11.productServive.repository;

import com.n11.productServive.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByVisibleTrue();

    Page<Product> findAllByVisibleTrue(Pageable pageable);

    Optional<Product> findByIdAndVisibleTrue(Long id);
}
