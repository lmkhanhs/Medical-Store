package com.khanhlms.medical_store.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.khanhlms.medical_store.dtos.chat.ChatMessageRequest;
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
        ChatMessageEntity saved = chatMessageService.saveMessage(
                request.getSender(),
                request.getReceiver(),
                request.getContent()
        );

        // 2️⃣ gửi cho người nhận
        messagingTemplate.convertAndSend(
                "/queue/chat." + request.getReceiver(),
                saved
        );

        // 3️⃣ gửi lại cho người gửi
        messagingTemplate.convertAndSend(
                "/queue/chat." + request.getSender(),
                saved
        );
    }
}
