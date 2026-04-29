package com.n11.productServive.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {
    @NotNull
    @Positive
    private Long price;
    private String img;
    private String labels;
    private String brand;
    private String color;
    private String title;
    private String category;
    private String description;
}
