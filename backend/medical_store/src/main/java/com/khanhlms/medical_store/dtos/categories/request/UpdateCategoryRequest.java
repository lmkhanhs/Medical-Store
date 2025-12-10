package com.khanhlms.medical_store.dtos.categories.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCategoryRequest {
    String id;
    String name;
    String description;
    MultipartFile image;
    Boolean active;
    Boolean deleted;
    Integer position;
}
