package com.khanhlms.medical_store.controllers;

import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.services.ProductsSercvice;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductsController {
    ProductsSercvice productsSercvice;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CreateProductResponse> createProduct
            (@ModelAttribute CreateProductRequest createProductRequest) {
        ApiResponse<CreateProductResponse> apiResponse = ApiResponse.<CreateProductResponse>builder()
                .code(201)
                .message("created product successfully ")
                .data(productsSercvice.createProduct(createProductRequest))
                .build();
        return apiResponse;
    }
}
