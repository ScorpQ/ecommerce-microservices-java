package com.n11.productServive.service.impl;

import com.n11.productServive.document.ProductDocument;
import com.n11.productServive.dto.request.ProductRequest;
import com.n11.productServive.dto.response.ProductResponse;
import com.n11.productServive.entity.Product;
import com.n11.productServive.event.ProductCreatedEvent;
import com.n11.productServive.exception.ProductNotFoundException;
import com.n11.productServive.mapper.ProductMapper;
import com.n11.productServive.repository.ProductRepository;
import com.n11.productServive.service.OpenSearchService;
import com.n11.productServive.service.ProductService;
import com.n11.productServive.service.S3Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final S3Service s3Service;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OpenSearchService openSearchService;

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper, S3Service s3Service, KafkaTemplate<String, Object> kafkaTemplate, OpenSearchService openSearchService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.s3Service = s3Service;
        this.kafkaTemplate = kafkaTemplate;
        this.openSearchService = openSearchService;
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
        Product saved = productRepository.save(productMapper.toEntity(request));
        try {
            kafkaTemplate.send("product-created", new ProductCreatedEvent(saved.getId(), saved.getTitle()));
        } catch (Exception e) {
            System.err.println("Kafka send failed for product-created: " + e.getMessage());
        }
        openSearchService.indexProduct(saved);
        return productMapper.toResponse(saved);
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
        Product saved = productRepository.save(product);
        openSearchService.indexProduct(saved);
        return productMapper.toResponse(saved);
    }

    @Override
    public void deleteById(Long id) {
        Product product = findById(id);
        product.setVisible(false);
        productRepository.save(product);
        openSearchService.deleteProduct(id);
    }

    @Override
    public void deleteAll() {
        List<Product> products = productRepository.findAllByVisibleTrue();
        products.forEach(p -> p.setVisible(false));
        productRepository.saveAll(products);
    }

    @Override
    public Page<ProductResponse> getPaged(int page, int size, String category) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (category != null && !category.isBlank()) {
            return productRepository.findAllByVisibleTrueAndCategoryIgnoreCase(category, pageRequest)
                    .map(productMapper::toResponse);
        }
        return productRepository.findAllByVisibleTrue(pageRequest)
                .map(productMapper::toResponse);
    }

    @Override
    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    @Override
    public ProductResponse uploadImage(Long id, MultipartFile file) throws Exception {
        Product product = findById(id);
        String url = s3Service.upload(file);
        product.setImg(url);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public List<ProductResponse> search(String query) {
        List<ProductDocument> documents = openSearchService.search(query);
        return documents.stream()
                .map(doc -> {
                    ProductResponse response = new ProductResponse();
                    response.setId(doc.getId());
                    response.setTitle(doc.getTitle());
                    response.setDescription(doc.getDescription());
                    response.setCategory(doc.getCategory());
                    response.setBrand(doc.getBrand());
                    response.setColor(doc.getColor());
                    response.setPrice(doc.getPrice());
                    response.setImg(doc.getImg());
                    response.setLabels(doc.getLabels());
                    return response;
                })
                .toList();
    }

    private Product findById(Long id) {
        return productRepository.findByIdAndVisibleTrue(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
