package com.n11.cartService.service.impl;

import com.n11.cartService.dto.AddItemRequest;
import com.n11.cartService.entity.CartItem;
import com.n11.cartService.entity.ShoppingCart;
import com.n11.cartService.exception.CartNotFoundException;
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

    public ShoppingCartServiceImpl(ShoppingCartRepository cartRepository,
                                   CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    public ShoppingCart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    ShoppingCart cart = new ShoppingCart();
                    cart.setUserId(userId);
                    return cartRepository.save(cart);
                });
    }

    @Override
    @Transactional
    public ShoppingCart addItem(Long userId, AddItemRequest request) {
        if (request.productId() == null || request.quantity() == null || request.quantity() <= 0) {
            throw new IllegalArgumentException("productId and quantity are required");
        }

        ShoppingCart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), request.productId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProductId(request.productId());
                    newItem.setPrice(request.price());
                    return newItem;
                });

        item.setQuantity(item.getQuantity() == null
                ? request.quantity()
                : item.getQuantity() + request.quantity());

        cartItemRepository.save(item);
        return cartRepository.findByUserId(userId).orElseThrow(() -> new CartNotFoundException(userId));
    }

    @Override
    @Transactional
    public ShoppingCart removeItem(Long userId, Long productId) {
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));

        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public ShoppingCart updateQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(userId));

        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));

        return cartRepository.save(cart);
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
