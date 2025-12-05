package com.khanhlms.medical_store.controllers;

import com.khanhlms.medical_store.dtos.manufacturer.requests.CreateManufaturerRequest;
import com.khanhlms.medical_store.dtos.manufacturer.requests.UpdateManufacturerRequest;
import com.khanhlms.medical_store.dtos.manufacturer.response.ManufacturerResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.services.ManufacturerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.service.annotation.PutExchange;

import java.util.List;

@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ManufacturerController {
    ManufacturerService manufacturerService;
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/manufacturers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ManufacturerResponse>> handleCreateManufacturer
            (@ModelAttribute CreateManufaturerRequest  createManufaturerRequest) {
        ApiResponse<ManufacturerResponse> apiResponse = ApiResponse.<ManufacturerResponse>builder()
                .code(201)
                .message("Manufacturer created successfully")
                .data(manufacturerService.handCreateManufacturer(createManufaturerRequest))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping(value = "/manufacturers")
    public ApiResponse<List<ManufacturerResponse>> getAllManufacturers() {
        return ApiResponse.<List<ManufacturerResponse>>builder()
                .code(200)
                .message("Manufacturer list successfully")
                .data(manufacturerService.getAllManufacturers())
                .build();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/manufacturers/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ManufacturerResponse> handleUpdateManufacturer(
            @ModelAttribute UpdateManufacturerRequest request,
            @PathVariable String id
    ) {
        return ApiResponse.<ManufacturerResponse>builder()
                .code(200)
                .message("Update manufacture successfully!")
                .data(manufacturerService.handUpdateManufacturer(id, request))
                .build();
    }
}
