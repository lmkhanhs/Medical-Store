package com.khanhlms.medical_store.repositories.custom.impl;

import com.khanhlms.medical_store.entities.ProductsEntity;
import com.khanhlms.medical_store.repositories.custom.ProductCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ProductCustomImpl implements ProductCustom {

    @PersistenceContext
    private EntityManager entityManager;

    // =========================
    // Search by keyword
    // =========================
    @Override
    public List<ProductsEntity> getProductsByKeyword(String keyword) {

        String sql = """
            SELECT *
            FROM products
            WHERE (
                    LOWER(name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(benefit) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
              AND is_active = 1
              AND is_deleted = 0
            ORDER BY position ASC
        """;

        Query query = entityManager.createNativeQuery(sql, ProductsEntity.class);
        query.setParameter("keyword", keyword);

        return query.getResultList();
    }

    // =========================
    // Filter products
    // =========================
    @Override
    public Page<ProductsEntity> filterProducts(
            Map<String, String> filters,
            Pageable pageable
    ) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // ===== Query lấy data =====
        CriteriaQuery<ProductsEntity> cq = cb.createQuery(ProductsEntity.class);
        Root<ProductsEntity> root = cq.from(ProductsEntity.class);

        List<Predicate> predicates = buildPredicates(filters, cb, root);

        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("createdAt")));

        TypedQuery<ProductsEntity> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<ProductsEntity> resultList = query.getResultList();

        // ===== Query count =====
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ProductsEntity> countRoot = countQuery.from(ProductsEntity.class);

        List<Predicate> countPredicates = buildPredicates(filters, cb, countRoot);

        countQuery.select(cb.count(countRoot))
                .where(countPredicates.toArray(new Predicate[0]));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(resultList, pageable, total);
    }

    // =========================
    // Build predicates (REUSE)
    // =========================
    private List<Predicate> buildPredicates(
            Map<String, String> filters,
            CriteriaBuilder cb,
            Root<ProductsEntity> root
    ) {

        List<Predicate> predicates = new ArrayList<>();

        // luôn loại bỏ sản phẩm đã xoá
        predicates.add(cb.isFalse(root.get("isDeleted")));

        // categoryId
        if (filters.containsKey("categoryId") && !filters.get("categoryId").isBlank()) {
            predicates.add(cb.equal(
                    root.get("category").get("id"),
                    filters.get("categoryId")
            ));
        }

        // manufacturerId
        if (filters.containsKey("manufacturerId") && !filters.get("manufacturerId").isBlank()) {
            predicates.add(cb.equal(
                    root.get("manufacturer").get("id"),
                    filters.get("manufacturerId")
            ));
        }

        // origin
        if (filters.containsKey("origin") && !filters.get("origin").isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("origin")),
                    "%" + filters.get("origin").toLowerCase() + "%"
            ));
        }

        // minPrice
        if (filters.containsKey("minPrice") && !filters.get("minPrice").isBlank()) {
            Double minPrice = Double.valueOf(filters.get("minPrice"));
            predicates.add(cb.greaterThanOrEqualTo(
                    root.get("originPrice"), minPrice
            ));
        }

        // maxPrice
        if (filters.containsKey("maxPrice") && !filters.get("maxPrice").isBlank()) {
            Double maxPrice = Double.valueOf(filters.get("maxPrice"));
            predicates.add(cb.lessThanOrEqualTo(
                    root.get("originPrice"), maxPrice
            ));
        }

        return predicates;
    }

    // =========================
    // Recalculate rating
    // =========================
    @Override
    public void recalculateAllProductRatings() {

        String sql = """
            UPDATE products p
            LEFT JOIN (
                SELECT product_id, AVG(rating) AS avg_rating
                FROM reviews
                GROUP BY product_id
            ) r ON p.id = r.product_id
            SET p.rating_avg = COALESCE(ROUND(r.avg_rating, 1), 0)
        """;

        entityManager.createNativeQuery(sql).executeUpdate();
    }
}
