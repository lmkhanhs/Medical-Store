package com.khanhlms.medical_store.dtos.products.requests;

import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProductRequest {
    String name;
    String description;
    Double price;
    String currency;
    Integer quantity;
    Boolean precription;
    String usage; // cách sử dụng
    String benefit; // lợi ích
    String sideEffect; // tác dụng phụ
    String note;
    String preserve;
    Date productDate;
    Date expirationDate;
    String manufacturerId;
    String categoryId;
    String unit;
    Boolean isActive;
    Integer position;
    List<MultipartFile> images;
}
