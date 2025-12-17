package com.khanhlms.medical_store.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.khanhlms.medical_store.dtos.chat.ChatMessageRequest;
import com.khanhlms.medical_store.dtos.chat.response.MessageResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.dtos.response.UserResponse;
import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.services.ChatMessageService;
import com.khanhlms.medical_store.utills.AuthenticationUtills;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageService chatMessageService;
    private final AuthenticationUtills authenticationUtills; 
    @GetMapping("/chat/history")
    public ApiResponse<List<MessageResponse>> getChatHistory(
            @RequestParam String friendId
    ) {
        String username = authenticationUtills.getUserName();
        return ApiResponse.<List<MessageResponse>>builder()
                .code(200)
                .message("get message ")
                .data(this.chatMessageService.getChatWithUser(username, friendId))
                .build();
    }
    @PostMapping("/chat/")
    public ApiResponse<MessageResponse> createChat(@RequestBody ChatMessageRequest chatMessageRequest) {
        
        return ApiResponse.<MessageResponse>builder()
                    .code(200)
                    .message("create message successfully!")
                    .data(this.chatMessageService.saveMessage(chatMessageRequest))
                    .build();
    }
    @GetMapping("/chat/people")
    public ApiResponse<List<UserResponse>> getUsers() {
        String username = authenticationUtills.getUserName();
        return ApiResponse.<List<UserResponse>>builder()
                .code(200)
                .message("get user chat with :" + username)
                .data(this.chatMessageService.getAllUserChatWith(username))
                .build();
    }
    
    
}
