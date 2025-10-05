package com.khanhlms.medical_store.controllers;

import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.dtos.products.response.ProductResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.services.ProductsSercvice;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductsController {
    ProductsSercvice productsSercvice;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CreateProductResponse>> createProduct
            (@ModelAttribute CreateProductRequest createProductRequest) {
        ApiResponse<CreateProductResponse> apiResponse = ApiResponse.<CreateProductResponse>builder()
                .code(201)
                .message("created product successfully ")
                .data(productsSercvice.createProduct(createProductRequest))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    @GetMapping("/products")
    public ApiResponse<List<ProductResponse>> getProduct
            ( @RequestParam(defaultValue = "0") Integer page,
              @RequestParam(defaultValue = "20") Integer size,
              HttpServletRequest httpServletRequest
              ){
        String uri = httpServletRequest.getRequestURI();
        String queryString = httpServletRequest.getQueryString();
        String cacheKey = queryString != null ? uri + "?" + queryString : uri + "&page=0&size=20";
        log.warn("cacheKey: {}", cacheKey);
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<List<ProductResponse>>builder()
                .message("get product by page succcesfully")
                .data(this.productsSercvice.handGetProduct(cacheKey,pageable))
                .build();
    }
}
