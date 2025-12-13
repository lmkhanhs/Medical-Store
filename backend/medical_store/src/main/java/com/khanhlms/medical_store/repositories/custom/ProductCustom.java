package com.khanhlms.medical_store.repositories.custom;

import com.khanhlms.medical_store.dtos.products.response.ProductResponse;
import com.khanhlms.medical_store.entities.ProductsEntity;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductCustom {
    List<ProductsEntity> getProductsByKeyword(String keyword);
    Page<ProductsEntity> filterProducts(Map<String, String> filters, Pageable pageable);
    void recalculateAllProductRatings();
}
