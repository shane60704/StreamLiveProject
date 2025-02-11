package com.example.streamlive.model.product;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductInfo {
    private Long id;
    private String name;
    private String description;
    private Long stock;
    private Long price;
    @JsonProperty("main_Image")
    private String mainImage;
    @JsonProperty("created_at")
    private String createdAt;
}
