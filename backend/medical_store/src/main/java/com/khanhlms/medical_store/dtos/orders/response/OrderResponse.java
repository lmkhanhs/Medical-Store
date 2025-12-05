package com.khanhlms.medical_store.dtos.orders.response;

import java.util.List;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    Double totalAmount;
    String status;
    String address;
    String city;
    String ward;
    String note;
    String phoneNumber;
    OrderPayment orderPayment;
    List<OrderItem> orderItems;
}
