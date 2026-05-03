package com.n11.order_service.repository;

import java.util.List;
import com.n11.order_service.entity.Order;
import com.n11.order_service.entity.OrderStatus;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsername(String username);
    List<Order> findByUsernameAndStatus(String username, OrderStatus status);
}
