package com.n11.productServive.repository;

import com.n11.productServive.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByVisibleTrue();

    Page<Product> findAllByVisibleTrue(Pageable pageable);

    Optional<Product> findByIdAndVisibleTrue(Long id);

    // Bu aslında kabul edilebilir bir şey değil, category adında bir tablodan çekilmesi lazım ve OneToMany ilişkisi içermeli
    // Products tablosu ile. Şu an yetişmesi için böyle yapıyorum :) Teşekkürler.
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.visible = true ORDER BY p.category")
    List<String> findDistinctCategories();
}
