package com.khanhlms.medical_store.dtos.orders.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonthlyRevenue {

    Double january;
    Double february;
    Double march;
    Double april;
    Double may;
    Double june;

    Double july;
    Double august;
    Double september;
    Double october;
    Double november;
    Double december;
}
