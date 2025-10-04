package com.khanhlms.medical_store.dtos.products.response;

import org.springframework.web.multipart.MultipartFile;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateProductResponse {
    String name;
    String description;
    Double price;
    Date productDate;
    Date expirationDate;
    String manufacturerName;
    String categoryName;
    List<String> imageUrl;
}
