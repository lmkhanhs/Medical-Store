package com.khanhlms.medical_store.dtos.response;


import lombok.Builder;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    String id;
    String username;
    String email;
    Boolean isActive;
    String fullName;
    String phoneNumber;
    String address;
    String city;
    String ward;
    String avatarUrl;
    LocalDateTime createdAt;
    LocalDateTime lastLogin;
}
