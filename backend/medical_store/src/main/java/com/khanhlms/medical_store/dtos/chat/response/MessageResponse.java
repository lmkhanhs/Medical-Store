package com.khanhlms.medical_store.dtos.chat.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

import com.khanhlms.medical_store.dtos.response.UserResponse;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class MessageResponse {
    UserResponse sender;
    UserResponse reciever;
    String message;
    LocalDateTime createAt;
}
