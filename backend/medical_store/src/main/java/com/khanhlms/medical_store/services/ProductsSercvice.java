package com.khanhlms.medical_store.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.requests.IngredientRequest;
import com.khanhlms.medical_store.dtos.products.requests.UpdateProductRequest;
import com.khanhlms.medical_store.dtos.products.response.CategoryProductCount;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.dtos.products.response.DetailProduct;
import com.khanhlms.medical_store.dtos.products.response.ProductResponse;
import com.khanhlms.medical_store.entities.IngredientEntity;
import com.khanhlms.medical_store.entities.ProductsEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.ProductsMapper;
import com.khanhlms.medical_store.repositories.ProductRepository;
import com.khanhlms.medical_store.utills.BaseRedisUtils;
import com.khanhlms.medical_store.utills.ReflexUtills;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductsSercvice {
    ProductRepository productRepository;
    ProductsMapper  productsMapper;
    BaseRedisUtils redisUtils;
    private ObjectMapper objectMapper = new  ObjectMapper();
    public CreateProductResponse createProduct(CreateProductRequest request, List<IngredientRequest>  ingredients) {
        ProductsEntity productsEntity = this.productsMapper.toEntity(request);
        Date productDate = productsEntity.getProductDate();
        Date expirationDate = productsEntity.getExpirationDate();
        if (productDate.getTime() > expirationDate.getTime()) {
            throw new AppException(ErrorCode.EXPIRERATION_EXCEPTION);
        }
        productsEntity.setIngredients(mapIngredientEntity(ingredients));
        productsEntity.setIsActive(true);
        productsEntity.setIsDeleted(false);
        productsEntity.setRatingAvg(0.0);
        productsEntity.setSoldQuantity(0);
        productsEntity.setPosition((int)this.productRepository.count());
        if (productsEntity.getImages() != null) {
            productsEntity.getImages().forEach(img -> img.setProduct(productsEntity));
        }
        if (productsEntity.getIngredients() != null) {
            productsEntity.getIngredients().forEach(ingredient -> ingredient.setProduct(productsEntity));
        }

        return this.productsMapper.toCreateProductResponse(productRepository.save(productsEntity));
    }

    // private List<IngredientEntity> mapIngredientEntity(List<IngredientRequest> ingredientRequests){
    //     if (ingredientRequests == null || ingredientRequests.isEmpty()) {return Collections.emptyList();}
    //     return ingredientRequests.stream()
    //             .map(ingredientRequest -> {
    //                 return  IngredientEntity.builder()
    //                         .name(ingredientRequest.getName())
    //                         .description(ingredientRequest.getDescription())
    //                         .amount(ingredientRequest.getAmount())
    //                         .unit(ingredientRequest.getUnit())
    //                         .build();
    //             })
    //             .toList();
    // }
    private List<IngredientEntity> mapIngredientEntity(List<IngredientRequest> ingredientRequests) {
    if (ingredientRequests == null || ingredientRequests.isEmpty()) {
        return new ArrayList<>();
    }

    return ingredientRequests.stream()
            .map(req -> IngredientEntity.builder()
                    .name(req.getName())
                    .description(req.getDescription())
                    .amount(req.getAmount())
                    .unit(req.getUnit())
                    .build())
            .collect(Collectors.toCollection(ArrayList::new)); // ✅ MUTABLE
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
                this.redisUtils.set(redisKey,valueString, 1l,  TimeUnit.SECONDS);
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
    public DetailProduct handGetDetailProduct(String productId) {
        ProductsEntity product = this.productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        var result = productsMapper.toDetailProduct(product);
        double percentage = 0;
        if (product.getDiscount() != null) {
            percentage = product.getDiscount().getPercent();
        }
        result.setDiscountPercen(percentage);
        result.setDiscountPrice(result.getOriginPrice() * (100 - percentage ) / 100);
        return result;
    }
    public List<ProductResponse> getByKeyword(String keyword, Pageable pageable) {
        if (keyword.equals("")) return Collections.emptyList();
        return this.productRepository.getProductsByKeyword(keyword).stream()
                .map(product -> this.productsMapper.toProductResponse(product))
                .toList();
    }
    
    public DetailProduct handlerUpdateProduct(
        String productId,
        UpdateProductRequest request,
        List<IngredientRequest> ingredients
    ) {

    ProductsEntity product = productRepository.findById(productId)
            .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

    // check duplicate name
    if (request.getName() != null) {
        productRepository.findByName(request.getName())
                .filter(p -> !p.getId().equals(productId))
                .ifPresent(p -> {
                    throw new AppException(ErrorCode.PRODUCT_EXISTED);
                });
    }

    // check date
    if (request.getProductDate() != null && request.getExpirationDate() != null) {
        if (request.getProductDate().after(request.getExpirationDate())) {
            throw new AppException(ErrorCode.EXPIRERATION_EXCEPTION);
        }
    }

    // 🔥 UPDATE FIELD
    productsMapper.updateEntity(product, request);

    // 🔥 UPDATE INGREDIENTS
    if (ingredients != null) {
        product.getIngredients().clear();
        List<IngredientEntity> newIngredients = mapIngredientEntity(ingredients);
        newIngredients.forEach(i -> i.setProduct(product));
        product.getIngredients().addAll(newIngredients);
    }

    // images
    if (product.getImages() != null) {
        product.getImages().forEach(img -> img.setProduct(product));
    }

        return productsMapper.toDetailProduct(productRepository.save(product));
    }   
    
    @Scheduled(fixedRate = 1 * 60 * 1000) // 1 phút
    @Transactional
    public void updateAvgStrat(){
        log.info("🔄 Start recalculating product ratings...");
        this.productRepository.recalculateAllProductRatings();
    }
    public void handleDeleteProduct(String id){
        ProductsEntity productsEntity =  this.productRepository.findById(id)
                                        .orElseThrow(()-> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
                            
        productsEntity.setIsDeleted(true);
        this.productRepository.save(productsEntity);
    }

    public long countActiveProducts() {
        return productRepository.countByIsDeletedFalse();
    }
    public List<CategoryProductCount> getProductCountByCategory() {

    // 1️⃣ Lấy dữ liệu từ DB (chưa có percentage)
    List<CategoryProductCount> data = productRepository.countProductsByCategory();

    // 2️⃣ Tính tổng số sản phẩm (chưa xoá)
    long total = data.stream()
            .mapToLong(CategoryProductCount::getProductCount)
            .sum();

    // 3️⃣ Tính percentage cho từng category
    data.forEach(item -> {
        double percentage = total == 0
                ? 0
                : (item.getProductCount() * 100.0 / total);

        // làm tròn 2 chữ số thập phân
        item.setPercentage(Math.round(percentage * 100.0) / 100.0);
    });

    return data;
    }

   public List<ProductResponse> getProductDeleted(Pageable pageable) {
    return productRepository.findAllByIsDeletedTrue(pageable)
            .getContent() // 🔥 Page -> List
            .stream()
            .map(productsMapper::toProductResponse)
            .toList();
    }
    public ProductResponse handleRestore(String productID){
        ProductsEntity product = this.productRepository.findById(productID)
            .orElseThrow(()-> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setIsDeleted(false);
        return this.productsMapper.toProductResponse(this.productRepository.save(product));
    }   
    public List<ProductResponse> getTop10BestSellingProducts() {
    return productRepository
            .findTop10ByIsDeletedFalseAndIsActiveTrueOrderBySoldQuantityDesc()
            .stream()
            .map(productsMapper::toProductResponse)
            .toList();
    }


    public List<ProductResponse> handleFilter(
        Map<String, String> filters,
        Integer page,
        Integer size
    ) {

        int pageNumber = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 20;

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<ProductsEntity> pageResult =
                productRepository.filterProducts(filters, pageable);

        return pageResult.getContent()
                .stream()
                .map(productsMapper::toProductResponse)
                .toList();
    }


}
