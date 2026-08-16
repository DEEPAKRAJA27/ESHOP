package com.eshop.backend.repository;

import com.eshop.backend.model.CartItem;
import com.eshop.backend.dto.CartResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT new com.eshop.backend.dto.CartResponseDto(c.id, c.productId, c.quantity, p.name, p.price, p.image) " +
           "FROM CartItem c JOIN Product p ON c.productId = p.id WHERE c.userId = :userId")
    List<CartResponseDto> findCartItemsByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);

    void deleteByProductId(Long productId);
}
