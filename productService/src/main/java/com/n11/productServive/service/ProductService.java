package com.n11.productServive.service;

import com.n11.productServive.dto.request.ProductRequest;
import com.n11.productServive.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    ProductResponse getById(Long id);
    List<ProductResponse> getAll();
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void deleteById(Long id);
    void deleteAll();
    Page<ProductResponse> getPaged(int page, int size);
    ProductResponse uploadImage(Long id, MultipartFile file) throws Exception;
    List<String> getCategories();
}
