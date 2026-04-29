package com.n11.cartService.service.impl;

import com.n11.cartService.client.ProductClient;
import com.n11.cartService.client.dto.ProductResponse;
import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.dto.response.ShoppingCartResponse;
import com.n11.cartService.exception.CartNotFoundException;
import com.n11.cartService.mapper.ShoppingCartMapper;
import com.n11.cartService.model.CartItem;
import com.n11.cartService.model.ShoppingCart;
import com.n11.cartService.service.ShoppingCartService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ShoppingCartServiceImpl implements ShoppingCartService {

    private static final String KEY_PREFIX = "cart:";

    private final RedisTemplate<String, ShoppingCart> redisTemplate;
    private final ShoppingCartMapper cartMapper;
    private final ProductClient productClient;

    public ShoppingCartServiceImpl(RedisTemplate<String, ShoppingCart> redisTemplate,
                                   ShoppingCartMapper cartMapper,
                                   ProductClient productClient) {
        this.redisTemplate = redisTemplate;
        this.cartMapper = cartMapper;
        this.productClient = productClient;
    }

    @Override
    public ShoppingCartResponse getOrCreateCart(Long userId) {
        return cartMapper.toResponse(findOrCreate(userId));
    }

    @Override
    public ShoppingCartResponse addItem(Long userId, AddItemRequest request) {
        if (request.productId() == null || request.quantity() == null || request.quantity() <= 0) {
            throw new IllegalArgumentException("productId and quantity are required");
        }

        ProductResponse product = productClient.getById(request.productId());
        ShoppingCart cart = findOrCreate(userId);

        cart.getItems().stream()
                .filter(i -> i.getProductId().equals(request.productId()))
                .findFirst()
                .ifPresentOrElse(
                        i -> i.setQuantity(i.getQuantity() + request.quantity()),
                        () -> {
                            CartItem newItem = new CartItem();
                            newItem.setProductId(request.productId());
                            newItem.setPrice(product.getPrice());
                            newItem.setQuantity(request.quantity());
                            cart.getItems().add(newItem);
                        }
                );

        save(cart);
        return cartMapper.toResponse(cart);
    }

    @Override
    public ShoppingCartResponse removeItem(Long userId, Long productId) {
        ShoppingCart cart = findOrThrow(userId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        save(cart);
        return cartMapper.toResponse(cart);
    }

    @Override
    public ShoppingCartResponse updateQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        ShoppingCart cart = findOrThrow(userId);
        cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(quantity));

        save(cart);
        return cartMapper.toResponse(cart);
    }

    @Override
    public void clearCart(Long userId) {
        redisTemplate.delete(key(userId));
    }

    @Override
    public Map<String, Long> getTotalPrice(Long userId) {
        ShoppingCart cart = findOrThrow(userId);
        long total = cart.getItems().stream()
                .mapToLong(i -> i.getPrice() * i.getQuantity())
                .sum();
        return Map.of("totalPrice", total);
    }

    private ShoppingCart findOrCreate(Long userId) {
        ShoppingCart cart = redisTemplate.opsForValue().get(key(userId));
        if (cart == null) {
            cart = new ShoppingCart();
            cart.setUserId(userId);
            save(cart);
        }
        return cart;
    }

    private ShoppingCart findOrThrow(Long userId) {
        ShoppingCart cart = redisTemplate.opsForValue().get(key(userId));
        if (cart == null) throw new CartNotFoundException(userId);
        return cart;
    }

    private void save(ShoppingCart cart) {
        redisTemplate.opsForValue().set(key(cart.getUserId()), cart);
    }

    private String key(Long userId) {
        return KEY_PREFIX + userId;
    }
}
