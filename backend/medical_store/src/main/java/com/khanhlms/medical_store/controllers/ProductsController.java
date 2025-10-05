package com.khanhlms.medical_store.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.dtos.products.requests.CreateProductRequest;
import com.khanhlms.medical_store.dtos.products.requests.IngredientRequest;
import com.khanhlms.medical_store.dtos.products.response.CreateProductResponse;
import com.khanhlms.medical_store.dtos.products.response.ProductResponse;
import com.khanhlms.medical_store.dtos.questions.request.CreateQuestionRequest;
import com.khanhlms.medical_store.dtos.questions.response.QuestionResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.entities.UserEntity;
import com.khanhlms.medical_store.services.ProductsSercvice;
import com.khanhlms.medical_store.services.QuestionService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductsController {

    ProductsSercvice productsSercvice;
    QuestionService  questionService;
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CreateProductResponse>> createProduct(
            @ModelAttribute CreateProductRequest createProductRequest,
            @RequestParam("ingredients") String ingredientsJson
    ) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<IngredientRequest> ingredients = mapper.readValue(
                ingredientsJson, new TypeReference<List<IngredientRequest>>() {}
        );

        ApiResponse<CreateProductResponse> apiResponse = ApiResponse.<CreateProductResponse>builder()
                .code(201)
                .message("Created product successfully")
                .data(productsSercvice.createProduct(createProductRequest, ingredients))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/products")
    public ApiResponse<List<ProductResponse>> getProduct(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            HttpServletRequest httpServletRequest
    ) {
        String uri = httpServletRequest.getRequestURI();
        String queryString = httpServletRequest.getQueryString();
        String cacheKey = queryString != null ? uri + "?" + queryString : uri + "&page=0&size=20";
        log.warn("cacheKey: {}", cacheKey);

        Pageable pageable = PageRequest.of(page, size);

        return ApiResponse.<List<ProductResponse>>builder()
                .message("Get product by page successfully")
                .data(productsSercvice.handGetProduct(cacheKey, pageable))
                .build();
    }

    @PostMapping("/products/{id}/questions")
    public ApiResponse<QuestionResponse> createQuestion
            (@PathVariable("id") String productId,
             @RequestBody CreateQuestionRequest createQuestionRequest)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return ApiResponse.<QuestionResponse>builder()
                .message("Create question successfully")
                .data(this.questionService.handCreateQuestion(productId, username ,createQuestionRequest ))
                .build();
    }
}
