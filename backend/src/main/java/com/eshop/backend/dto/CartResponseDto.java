package com.eshop.backend.dto;

import java.math.BigDecimal;

public class CartResponseDto {
    private Long id;
    private Long product_id;
    private Integer quantity;
    private String name;
    private BigDecimal price;
    private String image;

    public CartResponseDto(Long id, Long product_id, Integer quantity, String name, BigDecimal price, String image) {
        this.id = id;
        this.product_id = product_id;
        this.quantity = quantity;
        this.name = name;
        this.price = price;
        this.image = image;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProduct_id() { return product_id; }
    public void setProduct_id(Long product_id) { this.product_id = product_id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
