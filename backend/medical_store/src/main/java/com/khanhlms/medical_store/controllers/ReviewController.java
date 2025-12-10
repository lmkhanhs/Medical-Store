package com.khanhlms.medical_store.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.dtos.reviews.request.CreateReviewRequest;
import com.khanhlms.medical_store.dtos.reviews.response.ReviewResponse;
import com.khanhlms.medical_store.services.ReviewSerevice;
import com.khanhlms.medical_store.utills.AuthenticationUtills;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("${app.api.prefix}/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewSerevice reviewSerevice;
    AuthenticationUtills authenticationUtills;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(
        value = "",
        consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE
    )
    public ApiResponse<ReviewResponse> createReview(
            @ModelAttribute CreateReviewRequest createReviewRequest) {

        String username = authenticationUtills.getUserName();

        return ApiResponse.<ReviewResponse>builder()
                .code(201)
                .message("Create review successfully!")
                .data(reviewSerevice.handCreateReview(username, createReviewRequest))
                .build();
    }
}

