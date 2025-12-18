package com.khanhlms.medical_store.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Products")
@Builder
public class ProductsEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column(columnDefinition = "TEXT")
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    Double originPrice;
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    DiscountEntity discount;
    Boolean precription;
    Double ratingAvg;
    
    String unit;
    @Column(nullable = false)
    Date productDate;
    @Column(nullable = false)
    Date expirationDate;
    Integer quantity;

    String currency;
    Integer soldQuantity;
    Integer position;
    @Column(columnDefinition = "TEXT")
    String sideEffect; // tác dụng phụ
    String note;
    @Column(columnDefinition = "TEXT")
    String preserve; // cach bao quan
    @Column(name = "product_usage", columnDefinition = "TEXT")
    String usage; // cách sử dụng
    @Column(columnDefinition = "TEXT")
    String benefit; // lợi ích
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<IngredientEntity> ingredients;
//
    Boolean isActive;
    Boolean isDeleted;
//
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = false)
    List<OrderItemEntity> orderItems;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    ManufacturerEntity manufacturer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    CategoryEntity category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<ImagesEntity> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<QuestionEntity> questions;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<FrequentlyEntity>  frequently;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItemEntity> cartItems;

}
