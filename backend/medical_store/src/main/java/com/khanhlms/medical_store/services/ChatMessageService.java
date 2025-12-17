package com.khanhlms.medical_store.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.stereotype.Service;

import com.khanhlms.medical_store.dtos.chat.ChatMessageRequest;
import com.khanhlms.medical_store.dtos.chat.response.MessageResponse;
import com.khanhlms.medical_store.dtos.response.UserResponse;
import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.entities.UserEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.UserMapper;
import com.khanhlms.medical_store.repositories.ChatMessageRepository;
import com.khanhlms.medical_store.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {

    UserMapper userMapper;
    ChatMessageRepository chatMessageRepository;
    UserRepository userRepository;

    /* ===================== SEND MESSAGE ===================== */
    public MessageResponse saveMessage(ChatMessageRequest request) {

        UserEntity sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserEntity receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ChatMessageEntity message = ChatMessageEntity.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .isDeleted(false)
                .build();

        message = chatMessageRepository.save(message);

        return MessageResponse.builder()
                .sender(userMapper.toResponse(sender))
                .reciever(userMapper.toResponse(receiver))
                .message(message.getContent())
                .createAt(message.getCreatedAt())
                .build();
    }

    /* ===================== USER CHAT LIST ===================== */
    public List<UserResponse> getAllUserChatWith(String username) {

        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<ChatMessageEntity> sent = chatMessageRepository.findAllBySender(owner);
        List<ChatMessageEntity> received = chatMessageRepository.findAllByReceiver(owner);

        Set<String> userIds = new HashSet<>();

        sent.forEach(m -> userIds.add(m.getReceiver().getId()));
        received.forEach(m -> userIds.add(m.getSender().getId()));

        return userIds.stream()
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .map(userMapper::toResponse)
                .toList();
    }

    /* ===================== CHAT HISTORY (2 CHIỀU) ===================== */
    public List<MessageResponse> getChatWithUser(String username, String userId) {

        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserEntity friend = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // lấy 2 chiều
        List<ChatMessageEntity> messages1 =
                chatMessageRepository.findAllBySenderAndReceiver(owner, friend);

        List<ChatMessageEntity> messages2 =
                chatMessageRepository.findAllBySenderAndReceiver(friend, owner);

        List<ChatMessageEntity> allMessages = new ArrayList<>();
        allMessages.addAll(messages1);
        allMessages.addAll(messages2);

        // sort theo thời gian
        allMessages.sort(
                (a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt())
        );

        return allMessages.stream()
                .map(m -> MessageResponse.builder()
                        .sender(userMapper.toResponse(m.getSender()))
                        .reciever(userMapper.toResponse(m.getReceiver()))
                        .message(m.getContent())
                        .createAt(m.getCreatedAt())
                        .build()
                )
                .toList();
    }
}

