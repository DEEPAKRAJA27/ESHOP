package com.eshop.backend.controller;

import com.eshop.backend.dto.CartResponseDto;
import com.eshop.backend.model.CartItem;
import com.eshop.backend.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("user_id").toString());
        Long productId = Long.valueOf(body.get("product_id").toString());
        Integer quantity = body.get("quantity") != null ? Integer.valueOf(body.get("quantity").toString()) : 1;

        Optional<CartItem> existing = cartRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            CartItem updated = cartRepository.save(item);
            return ResponseEntity.ok(updated);
        }

        CartItem newItem = new CartItem(userId, productId, quantity);
        CartItem saved = cartRepository.save(newItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{userId}")
    public List<CartResponseDto> getUserCart(@PathVariable Long userId) {
        return cartRepository.findCartItemsByUserId(userId);
    }

    @DeleteMapping("/{userId}/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        Optional<CartItem> item = cartRepository.findByUserIdAndProductId(userId, productId);
        if (item.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Item not found in cart"));
        }
        cartRepository.deleteByUserIdAndProductId(userId, productId);
        Map<String, Object> res = Collections.singletonMap("message", "Item removed");
        return ResponseEntity.ok(res);
    }
}
