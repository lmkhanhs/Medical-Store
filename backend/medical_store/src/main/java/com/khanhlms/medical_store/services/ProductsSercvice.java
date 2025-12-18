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
import com.khanhlms.medical_store.entities.CategoryEntity;
import com.khanhlms.medical_store.entities.IngredientEntity;
import com.khanhlms.medical_store.entities.ManufacturerEntity;
import com.khanhlms.medical_store.entities.ProductsEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.ProductsMapper;
import com.khanhlms.medical_store.repositories.CategoriesRepository;
import com.khanhlms.medical_store.repositories.ManufacturerRepository;
import com.khanhlms.medical_store.repositories.ProductRepository;
import com.khanhlms.medical_store.utills.BaseRedisUtils;
import com.khanhlms.medical_store.utills.ReflexUtills;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.hibernate.engine.spi.ManagedEntity;
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
    ProductsMapper productsMapper;
    BaseRedisUtils redisUtils;
    ManufacturerRepository manufacturerRepository;
    CategoriesRepository categoriesRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    public CreateProductResponse createProduct(CreateProductRequest request, List<IngredientRequest> ingredients) {
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
        productsEntity.setPosition((int) this.productRepository.count());
        if (productsEntity.getImages() != null) {
            productsEntity.getImages().forEach(img -> img.setProduct(productsEntity));
        }
        if (productsEntity.getIngredients() != null) {
            productsEntity.getIngredients().forEach(ingredient -> ingredient.setProduct(productsEntity));
        }

        return this.productsMapper.toCreateProductResponse(productRepository.save(productsEntity));
    }

    // private List<IngredientEntity> mapIngredientEntity(List<IngredientRequest>
    // ingredientRequests){
    // if (ingredientRequests == null || ingredientRequests.isEmpty()) {return
    // Collections.emptyList();}
    // return ingredientRequests.stream()
    // .map(ingredientRequest -> {
    // return IngredientEntity.builder()
    // .name(ingredientRequest.getName())
    // .description(ingredientRequest.getDescription())
    // .amount(ingredientRequest.getAmount())
    // .unit(ingredientRequest.getUnit())
    // .build();
    // })
    // .toList();
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

    public List<ProductResponse> handGetProduct(String redisKey, Pageable pageable) {
        List<ProductResponse> result = null;
        if (Objects.isNull(this.redisUtils.getForString(redisKey))) {
            result = this.productRepository.findAllByIsActiveTrueAndIsDeletedFalse(pageable)
                    .stream()
                    .map(item -> this.productsMapper.toProductResponse(item))
                    .toList();
            try {
                String valueString = this.objectMapper.writeValueAsString(result);
                this.redisUtils.set(redisKey, valueString, 1l, TimeUnit.SECONDS);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            String dataRedis = (String) this.redisUtils.getForString(redisKey);
            try {
                // convert JSON string to List<ProductResponse>
                result = objectMapper.readValue(
                        dataRedis,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, ProductResponse.class));
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
        result.setDiscountPrice(result.getOriginPrice() * (100 - percentage) / 100);
        return result;
    }

    public List<ProductResponse> getByKeyword(String keyword, Pageable pageable) {
        if (keyword.equals(""))
            return Collections.emptyList();
        return this.productRepository.getProductsByKeyword(keyword).stream()
                .map(product -> this.productsMapper.toProductResponse(product))
                .toList();
    }

    public DetailProduct handlerUpdateProduct(
            String productId,
            UpdateProductRequest request,
            List<IngredientRequest> ingredients) {

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
    public void updateAvgStrat() {
        log.info("🔄 Start recalculating product ratings...");
        this.productRepository.recalculateAllProductRatings();
    }

    public void handleDeleteProduct(String id) {
        ProductsEntity productsEntity = this.productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

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

    public ProductResponse handleRestore(String productID) {
        ProductsEntity product = this.productRepository.findById(productID)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
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
            Integer size) {

        List<ProductsEntity> products = this.productRepository
                .findAll()
                .stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .toList();

        // ===== 1️⃣ Filter by Category =====
        String categoryId = filters.getOrDefault("categoryId", "null");
        if (!"null".equals(categoryId)) {
            CategoryEntity categoryEntity = this.categoriesRepository.findById(categoryId).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
            products = products.stream()
                    .filter(p -> p.getCategory() != null
                             && p.getCategory().getId().equals(categoryEntity.getId()))
                    .toList();
        }

        // ===== 2️⃣ Filter by Manufacturer =====
        String manufactureId = filters.getOrDefault("manufacturerId", "null");
        if (!"null".equals(manufactureId)) {
            ManufacturerEntity manufacturerEntity = this.manufacturerRepository.findById(manufactureId)
                                                .orElseThrow(() -> new AppException(ErrorCode.MANUFACTURER_NOT_FOUND));                   
            products = products.stream()
                    .filter(p -> p.getManufacturer().getId().equals(manufactureId))
                    .toList();
        }

        // ===== 3️⃣ Filter by Origin (country) =====
        String origin = filters.getOrDefault("origin", "null");
        if (!"null".equals(origin)) {
            products = products.stream()
                    .filter(p -> p.getManufacturer() != null
                            && p.getManufacturer().getCountry() != null
                            && p.getManufacturer().getCountry().equalsIgnoreCase(origin))
                    .toList();
        }

        // ===== 4️⃣ Filter by Price (FINAL PRICE) =====
        double minPrice = Double.parseDouble(filters.getOrDefault("minPrice", "0"));
        double maxPrice = Double.parseDouble(filters.getOrDefault("maxPrice", "0"));

        if (minPrice > 0 || maxPrice > 0) {
            products = products.stream()
                    .filter(p -> {
                        double originPrice = p.getOriginPrice();
                        double discountPercent = p.getDiscount() != null
                                ? p.getDiscount().getPercent()
                                : 0;

                        double finalPrice = originPrice * (100 - discountPercent) / 100;

                        boolean greaterThanMin = minPrice <= 0 || finalPrice >= minPrice;
                        boolean lessThanMax = maxPrice <= 0 || finalPrice <= maxPrice;

                        return greaterThanMin && lessThanMax;
                    })
                    .toList();
        }

        // ===== 5️⃣ Paging (optional) =====
        if (page != null && size != null && page >= 0 && size > 0) {
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, products.size());

            if (fromIndex >= products.size()) {
                return Collections.emptyList();
            }

            products = products.subList(fromIndex, toIndex);
        }

        // ===== 6️⃣ Map to DTO =====
        return products.stream()
                .map(productsMapper::toProductResponse)
                .toList();
    }
    public List<ProductResponse> getProductFlashSell(int limit) {

    return productRepository.findAll()
            .stream()
            // 1️⃣ chỉ lấy sản phẩm hợp lệ
            .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
            .filter(p -> Boolean.FALSE.equals(p.getIsDeleted()))
            .filter(p -> p.getDiscount() != null)

            // 2️⃣ sắp xếp theo % giảm giá giảm dần
            .sorted((p1, p2) -> 
                Double.compare(
                    p2.getDiscount().getPercent(),
                    p1.getDiscount().getPercent()
                )
            )

            // 3️⃣ giới hạn số lượng
            .limit(limit)

            // 4️⃣ map sang DTO
            .map(productsMapper::toProductResponse)
            .toList();
}

}
