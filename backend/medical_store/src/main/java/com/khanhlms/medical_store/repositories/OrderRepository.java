package com.khanhlms.medical_store.repositories;

import com.khanhlms.medical_store.entities.OrderEntity;
import com.khanhlms.medical_store.entities.UserEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    List<OrderEntity> findByUser(UserEntity user);
}
