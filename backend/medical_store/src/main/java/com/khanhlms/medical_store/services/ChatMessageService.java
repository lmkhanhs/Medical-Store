package com.khanhlms.medical_store.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

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


    public MessageResponse saveMessage(ChatMessageRequest chatMessageRequest ) {
        UserEntity sender = this.userRepository.findById(chatMessageRequest.getSenderId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserEntity receiver = this.userRepository.findById(chatMessageRequest.getReceiverId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        ChatMessageEntity message = ChatMessageEntity.builder()
                .sender(sender)
                .receiver(receiver)
                .content(chatMessageRequest.getContent())
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .build();
        message = chatMessageRepository.save(message);
        return MessageResponse.builder()
                .sender(userMapper.toResponse(message.getSender()))
                .reciever(userMapper.toResponse(message.getSender()))
                .message(message.getContent())
                .build();
    }

    // // lấy lịch sử chat 1 chiều
    // public List<ChatMessageEntity> getMessages(
    //         String sender,
    //         String receiver
    // ) {
    //     return chatMessageRepository
    //             .findBySenderAndReceiverAndIsDeletedFalseOrderByCreatedAtDesc(
    //                     sender, receiver
    //             );
    // }

    public List<UserResponse> getAllUserChatWith(String username){
        UserEntity userOwner = this.userRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<UserEntity> users = new LinkedList<>(); 
        List<ChatMessageEntity> chatbySender = this.chatMessageRepository.findAllBySender(userOwner); 
        List<ChatMessageEntity> chatbyReceive = this.chatMessageRepository.findAllByReceiver(userOwner);

        Set<String> uniqueUserID = new HashSet<>();


        for (ChatMessageEntity chatMessageEntity : chatbyReceive) {
            UserEntity sender = chatMessageEntity.getSender();
            uniqueUserID.add(sender.getId());
        }
        for (ChatMessageEntity chatMessageEntity : chatbySender ) {
            UserEntity receive = chatMessageEntity.getReceiver();
            uniqueUserID.add(receive.getId());
        }
        for (String string : uniqueUserID) {
            UserEntity userEntity = this.userRepository.findById(string).get();
            users.add(userOwner);
        }

        return users.stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
}
