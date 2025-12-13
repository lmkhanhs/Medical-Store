package com.khanhlms.medical_store.dtos.products.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryProductCount {
    String categoryId;
    String categoryName;
    Long productCount;
}