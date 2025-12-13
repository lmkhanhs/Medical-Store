package com.khanhlms.medical_store.dtos.products.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryProductCount {
    String categoryId;
    String categoryName;
    Long productCount;
    Double percentage; 

    public CategoryProductCount(String categoryId, String categoryName, Long productCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.productCount = productCount;
        this.percentage = 0.0;
    }
}