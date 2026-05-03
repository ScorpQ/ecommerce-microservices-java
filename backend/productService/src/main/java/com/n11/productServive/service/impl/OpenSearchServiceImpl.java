    package com.n11.productServive.service.impl;

    import com.n11.productServive.document.ProductDocument;
    import com.n11.productServive.entity.Product;
    import com.n11.productServive.service.OpenSearchService;
    import org.opensearch.client.opensearch.OpenSearchClient;
    import org.opensearch.client.opensearch.core.SearchResponse;
    import org.opensearch.client.opensearch.core.search.Hit;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    public class OpenSearchServiceImpl implements OpenSearchService {

        private static final String INDEX = "products";

        private final OpenSearchClient client;

        public OpenSearchServiceImpl(OpenSearchClient client) {
            this.client = client;
        }

        @Override
        public void indexProduct(Product product) {
            try {
                client.index(i -> i
                        .index(INDEX)
                        .id(String.valueOf(product.getId()))
                        .document(toDocument(product))
                );
            } catch (Exception e) {
                System.err.println("OpenSearch index failed for product " + product.getId() + ": " + e.getMessage());
            }
        }

        @Override
        public void deleteProduct(Long id) {
            try {
                client.delete(d -> d
                        .index(INDEX)
                        .id(String.valueOf(id))
                );
            } catch (Exception e) {
                System.err.println("OpenSearch delete failed for product " + id + ": " + e.getMessage());
            }
        }

        @Override
        public List<ProductDocument> search(String query) {
            try {
                SearchResponse<ProductDocument> response = client.search(s -> s
                        .index(INDEX)
                        .query(q -> q
                                .multiMatch(m -> m
                                        .query(query)
                                        .fields("title^3", "brand^2", "category^2", "description", "labels")
                                )
                        )
                        .size(20),
                        ProductDocument.class
                );
                return response.hits().hits().stream()
                        .map(Hit::source)
                        .toList();
            } catch (Exception e) {
                System.err.println("OpenSearch search failed: " + e.getMessage());
                return List.of();
            }
        }

        private ProductDocument toDocument(Product product) {
            return ProductDocument.builder()
                    .id(product.getId())
                    .title(product.getTitle())
                    .description(product.getDescription())
                    .category(product.getCategory())
                    .brand(product.getBrand())
                    .color(product.getColor())
                    .price(product.getPrice())
                    .img(product.getImg())
                    .labels(product.getLabels())
                    .build();
        }
    }
