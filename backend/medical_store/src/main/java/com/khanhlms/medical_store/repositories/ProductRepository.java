package com.khanhlms.medical_store.repositories;

import com.khanhlms.medical_store.dtos.products.response.CategoryProductCount;
import com.khanhlms.medical_store.entities.CategoryEntity;
import com.khanhlms.medical_store.entities.ProductsEntity;

import com.khanhlms.medical_store.repositories.custom.ProductCustom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;


@Repository
public interface ProductRepository extends JpaRepository<ProductsEntity, String>, ProductCustom {
    Optional<ProductsEntity> findByName(String name);
    long countByIsDeletedFalse();
    Page<ProductsEntity> findAllByIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    List<ProductsEntity> findByCategory(CategoryEntity category);
    @Query("""
    SELECT new com.khanhlms.medical_store.dtos.products.response.CategoryProductCount(
        c.id,
        c.name,
        COUNT(p)
    )
    FROM ProductsEntity p
    JOIN p.category c
    WHERE p.isDeleted = false
    GROUP BY c.id, c.name
    """)
    List<CategoryProductCount> countProductsByCategory();
    Page<ProductsEntity> findAllByIsDeletedTrue(Pageable pageable);

}
