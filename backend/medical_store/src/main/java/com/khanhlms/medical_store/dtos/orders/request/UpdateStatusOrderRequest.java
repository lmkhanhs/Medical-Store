package com.khanhlms.medical_store.dtos.orders.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class UpdateStatusOrderRequest {
    String orderId;
    String status;
}
