package com.khanhlms.medical_store.repositories;

import com.khanhlms.medical_store.entities.OrderEntity;
import com.khanhlms.medical_store.entities.UserEntity;

import io.lettuce.core.dynamic.annotation.Param;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    @Query("SELECT o FROM OrderEntity o WHERE o.user.id = :userId")
    List<OrderEntity> findByUserId(@Param("userId") String userId);
}
