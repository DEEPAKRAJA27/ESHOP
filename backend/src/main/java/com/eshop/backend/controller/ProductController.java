package com.eshop.backend.controller;

import com.eshop.backend.model.Product;
import com.eshop.backend.repository.ProductRepository;
import com.eshop.backend.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByIdAsc();
    }

    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Object priceObj = body.get("price");
        String image = (String) body.get("image");

        if (name == null || priceObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Name and price required"));
        }

        Product product = new Product();
        product.setName(name);
        product.setPrice(new java.math.BigDecimal(priceObj.toString()));
        product.setImage(image != null && !image.trim().isEmpty() ? image : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800");

        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setPrice(productDetails.getPrice());
            product.setImage(productDetails.getImage());
            Product updated = productRepository.save(product);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        cartRepository.deleteByProductId(id);
        productRepository.deleteById(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Product deleted"));
    }
}
