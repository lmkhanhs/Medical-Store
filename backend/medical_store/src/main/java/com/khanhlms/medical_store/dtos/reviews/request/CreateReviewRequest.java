package com.khanhlms.medical_store.dtos.reviews.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {
    String order_id;
    String item_id;
    Integer rating; 
    String comment; 
    MultipartFile image;
}
