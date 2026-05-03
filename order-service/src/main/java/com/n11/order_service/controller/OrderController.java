package com.n11.order_service.controller;


import com.n11.order_service.dto.CreateOrderRequest;
import com.n11.order_service.dto.OrderResponse;
import com.n11.order_service.service.impl.OrderServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderServiceImpl orderServiceImpl;
    public OrderController(OrderServiceImpl orderServiceImpl) {
        this.orderServiceImpl = orderServiceImpl;
    }

    @PostMapping("/create")
    public OrderResponse createOrder(@RequestBody CreateOrderRequest request) {
        return orderServiceImpl.createOrder(request);
    }

    @GetMapping("/all")
    public List<OrderResponse> getAllOrders() {
        return orderServiceImpl.findAllOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderServiceImpl.getOrderById(id);
    }

    @GetMapping("/user/{username}")
    public List<OrderResponse> getOrdersByUser(@PathVariable String username) {
        return orderServiceImpl.findOrdersByUsername(username);
    }

    @GetMapping("/my/completed")
    public List<OrderResponse> getMyCompletedOrders(@RequestHeader("X-User-Username") String username) {
        return orderServiceImpl.findCompletedOrdersByUsername(username);
    }
}