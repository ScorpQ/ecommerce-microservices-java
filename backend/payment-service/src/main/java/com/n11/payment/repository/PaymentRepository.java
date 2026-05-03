package com.n11.payment.repository;

import com.n11.payment.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByOrderId(Long orderId);
    List<PaymentRecord> findByUsername(String username);
}
