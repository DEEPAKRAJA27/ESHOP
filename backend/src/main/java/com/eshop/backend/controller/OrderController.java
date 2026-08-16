package com.eshop.backend.controller;

import com.eshop.backend.model.Order;
import com.eshop.backend.repository.CartRepository;
import com.eshop.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("user_id").toString());
        BigDecimal totalPrice = new BigDecimal(body.get("total_price").toString());

        Order order = new Order(userId, totalPrice);
        Order savedOrder = orderRepository.save(order);

        cartRepository.deleteByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order placed successfully");
        response.put("order", savedOrder);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
