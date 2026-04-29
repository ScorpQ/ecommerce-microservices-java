package com.n11.productServive.mapper;

import com.n11.productServive.entity.Product;
import com.n11.productServive.entity.ProductTranslation;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class ProductMapper {

    private static final String DEFAULT_LANG = "tr";

    public Map<String, Object> toI18nDto(Product product, String lang) {
        ProductTranslation translation = resolveTranslation(product, lang);

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", product.getId());
        dto.put("price", product.getPrice());
        dto.put("img", product.getImg());
        dto.put("labels", product.getLabels());
        dto.put("brand", product.getBrand());
        dto.put("color", product.getColor());
        dto.put("categoryKey", product.getCategoryKey());
        dto.put("title", translation != null ? translation.getTitle() : null);
        dto.put("description", translation != null ? translation.getDescription() : null);
        dto.put("tags", translation != null ? translation.getTags() : null);
        dto.put("searchText", translation != null ? translation.getSearchText() : null);
        dto.put("material", translation != null ? translation.getMaterial() : null);
        dto.put("productType", translation != null ? translation.getProductType() : null);
        dto.put("category", translation != null ? translation.getCategoryName() : null);
        return dto;
    }

    private ProductTranslation resolveTranslation(Product product, String lang) {
        if (product.getTranslations() == null || product.getTranslations().isEmpty()) return null;

        String targetLang = (lang == null || lang.isBlank()) ? DEFAULT_LANG : lang.toLowerCase(Locale.ROOT);

        return product.getTranslations().stream()
                .filter(t -> t != null && targetLang.equalsIgnoreCase(t.getLang()))
                .findFirst()
                .or(() -> product.getTranslations().stream()
                        .filter(t -> t != null && DEFAULT_LANG.equalsIgnoreCase(t.getLang()))
                        .findFirst())
                .orElse(product.getTranslations().getFirst());
    }
}
