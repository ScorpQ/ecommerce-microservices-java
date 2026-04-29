package com.n11.productServive.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private Long price;
    private String img;
    private String labels;
    private String brand;
    private String color;
    private String title;
    private String category;
    private String description;
}
