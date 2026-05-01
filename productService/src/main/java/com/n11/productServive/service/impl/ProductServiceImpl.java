package com.n11.productServive.service.impl;

import com.n11.productServive.dto.request.ProductRequest;
import com.n11.productServive.dto.response.ProductResponse;
import com.n11.productServive.entity.Product;
import com.n11.productServive.exception.ProductNotFoundException;
import com.n11.productServive.mapper.ProductMapper;
import com.n11.productServive.repository.ProductRepository;
import com.n11.productServive.service.ProductService;
import com.n11.productServive.service.S3Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final S3Service s3Service;

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper, S3Service s3Service) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.s3Service = s3Service;
    }

    @Override
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findById(id));
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAllByVisibleTrue().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        return productMapper.toResponse(productRepository.save(productMapper.toEntity(request)));
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImg() != null) product.setImg(request.getImg());
        if (request.getLabels() != null) product.setLabels(request.getLabels());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getColor() != null) product.setColor(request.getColor());
        if (request.getTitle() != null) product.setTitle(request.getTitle());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public void deleteById(Long id) {
        Product product = findById(id);
        product.setVisible(false);
        productRepository.save(product);
    }

    @Override
    public void deleteAll() {
        List<Product> products = productRepository.findAllByVisibleTrue();
        products.forEach(p -> p.setVisible(false));
        productRepository.saveAll(products);
    }

    @Override
    public Page<ProductResponse> getPaged(int page, int size) {
        return productRepository.findAllByVisibleTrue(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .map(productMapper::toResponse);
    }

    @Override
    public ProductResponse uploadImage(Long id, MultipartFile file) throws Exception {
        Product product = findById(id);
        String url = s3Service.upload(file);
        product.setImg(url);
        return productMapper.toResponse(productRepository.save(product));
    }

    private Product findById(Long id) {
        return productRepository.findByIdAndVisibleTrue(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
