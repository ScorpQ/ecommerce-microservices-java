package com.n11.cartService.service.impl;

import com.n11.cartService.client.ProductClient;
import com.n11.cartService.client.dto.ProductResponse;
import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.dto.response.ShoppingCartResponse;
import com.n11.cartService.entity.CartItem;
import com.n11.cartService.entity.ShoppingCart;
import com.n11.cartService.exception.CartNotFoundException;
import com.n11.cartService.mapper.ShoppingCartMapper;
import com.n11.cartService.repository.CartItemRepository;
import com.n11.cartService.repository.ShoppingCartRepository;
import com.n11.cartService.service.ShoppingCartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class ShoppingCartServiceImpl implements ShoppingCartService {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ShoppingCartMapper cartMapper;
    private final ProductClient productClient;

    public ShoppingCartServiceImpl(ShoppingCartRepository cartRepository,
                                   CartItemRepository cartItemRepository,
                                   ShoppingCartMapper cartMapper,
                                   ProductClient productClient) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartMapper = cartMapper;
        this.productClient = productClient;
    }

    @Override
    public ShoppingCartResponse getOrCreateCart(Long userId) {
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    ShoppingCart newCart = new ShoppingCart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
        return cartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public ShoppingCartResponse addItem(Long userId, AddItemRequest request) {
        if (request.productId() == null || request.quantity() == null || request.quantity() <= 0) {
            throw new IllegalArgumentException("productId and quantity are required");
        }

        ProductResponse product = productClient.getById(request.productId());

        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    ShoppingCart newCart = new ShoppingCart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), request.productId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProductId(request.productId());
                    newItem.setPrice(product.getPrice());
                    return newItem;
                });

        item.setQuantity(item.getQuantity() == null
                ? request.quantity()
                : item.getQuantity() + request.quantity());

        cartItemRepository.save(item);

        ShoppingCart updated = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));
        return cartMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public ShoppingCartResponse removeItem(Long userId, Long productId) {
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public ShoppingCartResponse updateQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));

        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    public Map<String, Long> getTotalPrice(Long userId) {
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));

        long total = cart.getItems().stream()
                .mapToLong(item -> item.getPrice() * item.getQuantity())
                .sum();

        return Map.of("totalPrice", total);
    }
}
