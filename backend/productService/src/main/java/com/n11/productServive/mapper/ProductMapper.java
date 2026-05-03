package com.n11.productServive.mapper;

import com.n11.productServive.dto.request.ProductRequest;
import com.n11.productServive.dto.response.ProductResponse;
import com.n11.productServive.entity.Product;
import org.springframework.stereotype.Component;

// Entity ve DTO dönüşümünü contollerda yapmak yerine merkezi bir yerde topladım.
@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setPrice(product.getPrice());
        response.setImg(product.getImg());
        response.setLabels(product.getLabels());
        response.setBrand(product.getBrand());
        response.setColor(product.getColor());
        response.setTitle(product.getTitle());
        response.setCategory(product.getCategory());
        response.setDescription(product.getDescription());
        return response;
    }

    public Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setPrice(request.getPrice());
        product.setImg(request.getImg());
        product.setLabels(request.getLabels());
        product.setBrand(request.getBrand());
        product.setColor(request.getColor());
        product.setTitle(request.getTitle());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        return product;
    }
}
