package com.n11.productServive.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDocument {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String brand;
    private String color;
    private Long price;
    private String img;
    private String labels;
}
