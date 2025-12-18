package com.khanhlms.medical_store.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.khanhlms.medical_store.dtos.chat.ChatMessageRequest;
import com.khanhlms.medical_store.dtos.chat.response.MessageResponse;
import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.services.ChatMessageService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request) {

        // 1️⃣ lưu DB
        MessageResponse saved = chatMessageService.saveMessage(request);

        // 2️⃣ gửi cho người nhận
        messagingTemplate.convertAndSend(
                "/queue/chat." + request.getReceiverId(),
                saved
        );

        // 3️⃣ gửi lại cho người gửi
        messagingTemplate.convertAndSend(
                "/queue/chat." + request.getSenderId(),
                saved
        );
    }
}
