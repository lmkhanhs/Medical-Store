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
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    Double originPrice;
    Double discount;
    Double ratingAvg;
    @Column(nullable = false)
    Date productDate;
    @Column(nullable = false)
    Date expirationDate;
    Integer quantity;
    String currency;
    Integer soldQuantity;
    Integer position;
//
    Boolean isActive;
    Boolean isDeleted;
//
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    ManufacturerEntity manufacturer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    CategoryEntity category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<ImagesEntity> images;

}
