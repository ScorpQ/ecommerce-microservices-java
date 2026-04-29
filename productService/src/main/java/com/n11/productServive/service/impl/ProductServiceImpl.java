package com.n11.productServive.service.impl;

import com.n11.productServive.dto.ProductTranslationDTO;
import com.n11.productServive.entity.Product;
import com.n11.productServive.entity.ProductTranslation;
import com.n11.productServive.exception.ProductNotFoundException;
import com.n11.productServive.mapper.ProductMapper;
import com.n11.productServive.repository.ProductRepository;
import com.n11.productServive.repository.ProductTranslationRepo;
import com.n11.productServive.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);
    private static final String DEFAULT_LANG = "tr";

    private final ProductRepository productRepository;
    private final ProductTranslationRepo translationRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              ProductTranslationRepo translationRepository,
                              ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.translationRepository = translationRepository;
        this.productMapper = productMapper;
    }

    @Override
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product update(Long id, Product updatedProduct) {
        Product product = getById(id);
        product.setImg(updatedProduct.getImg());
        product.setPrice(updatedProduct.getPrice());
        product.setLabels(updatedProduct.getLabels());
        product.setBrand(updatedProduct.getBrand());
        product.setColor(updatedProduct.getColor());
        product.setCategoryKey(updatedProduct.getCategoryKey());
        return productRepository.save(product);
    }

    @Override
    public void deleteById(Long id) {
        if (!productRepository.existsById(id)) throw new ProductNotFoundException(id);
        productRepository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        productRepository.deleteAll();
    }

    @Override
    public Page<Product> getPaged(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")));
    }

    @Override
    public Map<String, Object> getI18n(Long id, String lang) {
        return productMapper.toI18nDto(getById(id), lang);
    }

    @Override
    public List<Map<String, Object>> getAllI18n(String lang) {
        return getAll().stream()
                .map(p -> productMapper.toI18nDto(p, lang))
                .toList();
    }

    @Override
    public Map<String, Object> getPagedI18nResponse(int page, int size, String lang) {
        Page<Product> result = getPaged(page, size);
        List<Map<String, Object>> items = result.getContent().stream()
                .map(p -> productMapper.toI18nDto(p, lang))
                .toList();
        return Map.of(
                "items", items,
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "isLast", result.isLast()
        );
    }

    @Override
    @Transactional
    public Map<String, Object> upsertTranslation(Long productId, ProductTranslationDTO request) {
        if (request == null) throw new IllegalArgumentException("Translation body is required");

        Product product = getById(productId);
        String lang = (request.getLang() == null || request.getLang().isBlank())
                ? DEFAULT_LANG
                : request.getLang().toLowerCase(Locale.ROOT);

        ProductTranslation translation = translationRepository
                .findByProductIdAndLang(productId, lang)
                .orElseGet(ProductTranslation::new);

        translation.setProduct(product);
        translation.setLang(lang);
        translation.setTitle(request.getTitle());
        translation.setDescription(request.getDescription());
        translation.setTags(request.getTags());
        translation.setSearchText(resolveSearchText(request));
        translation.setMaterial(request.getMaterial());
        translation.setProductType(request.getProductType());
        translation.setCategoryName(request.getCategoryName());

        ProductTranslation saved = translationRepository.save(translation);

        return Map.of(
                "ok", true,
                "productId", product.getId(),
                "translationId", saved.getId(),
                "lang", saved.getLang()
        );
    }

    @Override
    public List<Map<String, Object>> searchI18n(String query, String lang, int topK) {
        String q = (query == null) ? "" : query.trim();
        String l = (lang == null || lang.isBlank()) ? DEFAULT_LANG : lang.toLowerCase(Locale.ROOT);

        List<Product> results = q.isBlank()
                ? productRepository.findAll(PageRequest.of(0, topK)).getContent()
                : productRepository.searchI18n(l, q, PageRequest.of(0, topK));

        return results.stream()
                .map(p -> productMapper.toI18nDto(p, l))
                .toList();
    }

    @Override
    @Transactional
    public void updateCategoryKey(String oldKey, String newKey) {
        if (oldKey == null || newKey == null || oldKey.equalsIgnoreCase(newKey)) return;
        int updated = productRepository.updateCategoryKeyForProducts(oldKey, newKey);
        log.info("Updated {} products: categoryKey '{}' -> '{}'", updated, oldKey, newKey);
    }

    @Override
    public Product uploadImage(Long id, MultipartFile file) throws Exception {
        Product product = getById(id);
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filepath = Paths.get("./images/products/", filename);
        Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
        product.setImg(filename);
        return productRepository.save(product);
    }

    private String resolveSearchText(ProductTranslationDTO request) {
        if (request.getSearchText() != null && !request.getSearchText().isBlank()) {
            return request.getSearchText();
        }
        String title = request.getTitle() == null ? "" : request.getTitle();
        String description = request.getDescription() == null ? "" : request.getDescription();
        String tags = request.getTags() == null ? "" : request.getTags();
        return (title + " " + description + " " + tags).trim();
    }
}
