package com.khanhlms.medical_store.dtos.orders.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {
    String name;
    String imageUrl;
    Double originPrice;
    Double ratingAvg;
    Double price;
    Double discountPrice;
    Integer quantity;
    Double total;
}
