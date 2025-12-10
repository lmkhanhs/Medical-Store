package com.khanhlms.medical_store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.khanhlms.medical_store.entities.ReviewEntity;

@Repository
public interface ReviewRepository  extends JpaRepository<ReviewEntity, String> {
    
}
