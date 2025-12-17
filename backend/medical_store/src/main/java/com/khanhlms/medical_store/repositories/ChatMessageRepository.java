package com.khanhlms.medical_store.repositories;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.khanhlms.medical_store.entities.ChatMessageEntity;
import com.khanhlms.medical_store.entities.UserEntity;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, String> {
    List<ChatMessageEntity> findAllBySenderAndReceiver(UserEntity sender, UserEntity receiver);
    List<ChatMessageEntity> findAllBySender(UserEntity sender);
    List<ChatMessageEntity> findAllByReceiver(UserEntity receiver);

}
