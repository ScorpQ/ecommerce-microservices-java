package com.n11.productServive.service;

import com.n11.productServive.document.ProductDocument;
import com.n11.productServive.entity.Product;

import java.util.List;

public interface OpenSearchService {
    void indexProduct(Product product);
    void deleteProduct(Long id);
    List<ProductDocument> search(String query);
}
