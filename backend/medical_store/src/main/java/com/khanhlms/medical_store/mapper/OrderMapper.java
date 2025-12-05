package com.khanhlms.medical_store.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import com.khanhlms.medical_store.dtos.orders.response.OrderItem;
import com.khanhlms.medical_store.dtos.orders.response.OrderPayment;
import com.khanhlms.medical_store.dtos.orders.response.OrderResponse;
import com.khanhlms.medical_store.entities.OrderEntity;
import com.khanhlms.medical_store.entities.OrderItemEntity;
import com.khanhlms.medical_store.entities.PaymentEntity;

@Mapper(componentModel = "spring")
public abstract class OrderMapper {
    @Autowired
    PaymentMapper paymentMapper;
    @Autowired
    OrderItemsMapper itemsMapper; 

    @Mapping(source = "orderEntity.payment", target =  "orderPayment", qualifiedByName = "mapPayment")
    @Mapping(source = "orderEntity", target = "orderItems", qualifiedByName = "mapItems")
    public abstract OrderResponse toOrderResponse(OrderEntity orderEntity);

    @Named("mapPayment")
    protected OrderPayment mapPayment(PaymentEntity paymentEntity){
        return this.paymentMapper.toOrderPayment(paymentEntity);
    }
    @Named("mapItems")
    protected List<OrderItem> mapItems(OrderEntity orderEntity){
        if(orderEntity == null || orderEntity.getOrderItems() == null){
            return null;
        }
        return orderEntity.getOrderItems()
                .stream()
                .map(orderItem -> this.itemsMapper.toOrderItem(orderItem))
                .toList();
    }
}
