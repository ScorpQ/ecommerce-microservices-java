package com.n11.productServive.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "product",
        indexes = {
                @Index(name = "idx_products_brand", columnList = "brand"),
                @Index(name = "idx_products_color", columnList = "color"),
                @Index(name = "idx_products_labels", columnList = "labels"),
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "price", nullable = false)
    private long price;

    @Column(name = "img", length = 512)
    private String img;

    @Column(name = "labels", length = 255)
    private String labels;

    @Column(name = "brand", length = 255)
    private String brand;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "title", nullable = false, length = 255)
    private String title = "-";

    @Column(name = "category", nullable = false, length = 255)
    private String category = "giysi";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
