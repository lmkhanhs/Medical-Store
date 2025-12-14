package com.khanhlms.medical_store.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.khanhlms.medical_store.dtos.chat.ChatMessageRequest;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.services.ChatMessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("${app.api.prefix}")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageService chatMessageService;

    @GetMapping("/chat/history")
    public ApiResponse<List<ChatMessageEntity>> getChatHistory(
            @RequestParam String sender,
            @RequestParam String receiver
    ) {
        return ApiResponse.<List<ChatMessageEntity>>builder()
                .code(200)
                .message("get message ")
                .data(this.chatMessageService.getMessages(sender, receiver))
                .build();
    }
    @PostMapping("/chat/")
    public ApiResponse<ChatMessageEntity> createChat(@RequestBody ChatMessageRequest chatMessageRequest) {
        
        return ApiResponse.<ChatMessageEntity>builder()
                    .code(200)
                    .message("create message successfully!")
                    .data(this.chatMessageService.saveMessage(chatMessageRequest.getSender(), chatMessageRequest.getReceiver(), chatMessageRequest.getContent()))
                    .build();
    }
    @GetMapping("/chat/people")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    
    
}
