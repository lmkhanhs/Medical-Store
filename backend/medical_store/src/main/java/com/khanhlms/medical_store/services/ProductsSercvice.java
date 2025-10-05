package com.khanhlms.medical_store.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.dtos.products.response.ProductResponse;
import com.khanhlms.medical_store.entities.ProductsEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.ProductsMapper;
import com.khanhlms.medical_store.repositories.ProductRepository;
import com.khanhlms.medical_store.utills.BaseRedisUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductsSercvice {
    ProductRepository productRepository;
    ProductsMapper  productsMapper;
    BaseRedisUtils redisUtils;
    private ObjectMapper objectMapper = new  ObjectMapper();
    public CreateProductResponse createProduct(CreateProductRequest request) {
        ProductsEntity productsEntity = this.productsMapper.toEntity(request);
        Date productDate = productsEntity.getProductDate();
        Date expirationDate = productsEntity.getExpirationDate();
        if (productDate.getTime() > expirationDate.getTime()) {
            throw new AppException(ErrorCode.EXPIRERATION_EXCEPTION);
        }
        productsEntity.setIsActive(true);
        productsEntity.setIsDeleted(false);
        productsEntity.setDiscount(0.0);
        productsEntity.setRatingAvg(0.0);
        productsEntity.setSoldQuantity(0);
        productsEntity.setPosition((int)this.productRepository.count());
        if (productsEntity.getImages() != null) {
            productsEntity.getImages().forEach(img -> img.setProduct(productsEntity));
        }

        return this.productsMapper.toCreateProductResponse(productRepository.save(productsEntity));
    }
    public List<ProductResponse> handGetProduct( String redisKey,Pageable pageable) {
        List<ProductResponse> result = null;
        if(Objects.isNull(this.redisUtils.getForString(redisKey))) {
             result = this.productRepository.findAllByIsActiveTrueAndIsDeletedFalse(pageable)
                    .stream()
                    .map(item -> this.productsMapper.toProductResponse(item))
                    .toList();
            try {
                String valueString = this.objectMapper.writeValueAsString(result);
                this.redisUtils.set(redisKey,valueString, 3600l,  TimeUnit.SECONDS);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
        else {
            String dataRedis = (String) this.redisUtils.getForString(redisKey);
            try {
                // convert JSON string to List<ProductResponse>
                result = objectMapper.readValue(
                        dataRedis,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, ProductResponse.class)
                );
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error parsing product list from Redis", e);
            }
        }
        return result;
    }
}
