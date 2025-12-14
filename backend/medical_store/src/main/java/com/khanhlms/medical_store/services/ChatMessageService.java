package com.khanhlms.medical_store.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.repositories.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageEntity saveMessage(
            String sender,
            String receiver,
            String content
    ) {
        ChatMessageEntity message = ChatMessageEntity.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .build();

        return chatMessageRepository.save(message);
    }

    // lấy lịch sử chat 1 chiều
    public List<ChatMessageEntity> getMessages(
            String sender,
            String receiver
    ) {
        return chatMessageRepository
                .findBySenderAndReceiverAndIsDeletedFalseOrderByCreatedAtDesc(
                        sender, receiver
                );
    }

    
}
