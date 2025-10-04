package com.khanhlms.medical_store.services;

import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.entities.ProductsEntity;
import com.khanhlms.medical_store.mapper.ProductsMapper;
import com.khanhlms.medical_store.repositories.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductsSercvice {
    ProductRepository productRepository;
    ProductsMapper  productsMapper;

    public CreateProductResponse createProduct(CreateProductRequest request) {
        ProductsEntity productsEntity = this.productsMapper.toEntity(request);
        productsEntity.setIsActive(true);
        productsEntity.setIsDeleted(false);
        productsEntity.setDiscount(0.0);
        if (productsEntity.getImages() != null) {
            productsEntity.getImages().forEach(img -> img.setProduct(productsEntity));
        }

        return this.productsMapper.toCreateProductResponse(productRepository.save(productsEntity));
    }
}
