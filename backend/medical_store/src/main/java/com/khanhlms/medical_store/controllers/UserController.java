package com.khanhlms.medical_store.controllers;

import com.khanhlms.medical_store.dtos.requests.CreateUserRequest;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.dtos.response.UserResponse;
import com.khanhlms.medical_store.dtos.users.requests.ChangeProfileRequest;
import com.khanhlms.medical_store.dtos.users.response.ProfileResponse;
import com.khanhlms.medical_store.services.UserService;
import com.khanhlms.medical_store.utills.AuthenticationUtills;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("${app.api.prefix}/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;
    AuthenticationUtills authenticationUtills;

    @GetMapping("")
    public String getUser() {
        return "Xin chào";
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<Boolean>> createUser(@RequestBody CreateUserRequest userRequest){
        ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .code(HttpStatus.CREATED.value())
                .message("User created successfully")
                .data(this.userService.handlCreateUser(userRequest))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ApiResponse<List<UserResponse>> getAllUser(){

        return  ApiResponse.<List<UserResponse>>builder()
                .message("Found all user")
                .data(this.userService.handleUserList())
                .build();
    }
    @GetMapping("/info")
    public ApiResponse<ProfileResponse> getUserProfile(){
        String username = authenticationUtills.getUserName();
        return ApiResponse.<ProfileResponse>builder()
                .message("get user profile")
                .code(200)
                .data(this.userService.handgetMyInfo(username))
                .build();
    }
    @PutMapping(value = "/info",  consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProfileResponse> updateProfile(
            @ModelAttribute ChangeProfileRequest changeProfileRequest
            ){
        String username = authenticationUtills.getUserName();
        return ApiResponse.<ProfileResponse>builder()
                .message("update user profile successfully")
                .code(200)
                .data(this.userService.handChangeProfile(username, changeProfileRequest))
                .build();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/count")
    public ApiResponse<Long> getUserNumber() {
        return ApiResponse.<Long>builder()
                .code(200)
                .message("get user number successfully!")
                .data(this.userService.getUserNumber())
                .build();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/status")
    public ApiResponse<UserResponse> channgeUserStatus(@RequestParam String id) {
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("change status user successfully ")
                .data(this.userService.handleChangeStatusUser(id))
                .build();
    }
    
}
