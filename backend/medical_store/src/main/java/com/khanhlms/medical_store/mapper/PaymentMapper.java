package com.khanhlms.medical_store.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.khanhlms.medical_store.dtos.orders.response.OrderPayment;
import com.khanhlms.medical_store.entities.PaymentEntity;

@Mapper(componentModel = "spring")
public abstract class PaymentMapper {
    public abstract OrderPayment toOrderPayment(PaymentEntity paymentEntity);
}
