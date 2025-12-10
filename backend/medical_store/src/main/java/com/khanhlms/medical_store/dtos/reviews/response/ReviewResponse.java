package com.khanhlms.medical_store.dtos.reviews.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    String imageUrl;
    Integer rating; 
    String comment;   
    String username;
    String avatarUrl; 
}
