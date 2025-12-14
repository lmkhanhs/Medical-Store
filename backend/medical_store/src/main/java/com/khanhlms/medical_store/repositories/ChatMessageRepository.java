package com.khanhlms.medical_store.repositories;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.khanhlms.medical_store.entities.ChatMessageEntity;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, String> {
    List<ChatMessageEntity>findBySenderAndIsDeletedFalseOrderByCreatedAtDesc(String sender);
    List<ChatMessageEntity>findBySenderAndReceiverAndIsDeletedFalseOrderByCreatedAtDesc(
        String sender,
        String receiver
    );

}
