package com.khanhlms.medical_store.services;

import org.springframework.stereotype.Service;

import com.khanhlms.medical_store.dtos.reviews.request.CreateReviewRequest;
import com.khanhlms.medical_store.dtos.reviews.response.ReviewResponse;
import com.khanhlms.medical_store.entities.OrderEntity;
import com.khanhlms.medical_store.entities.OrderItemEntity;
import com.khanhlms.medical_store.entities.ReviewEntity;
import com.khanhlms.medical_store.entities.UserEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.ReviewMapper;
import com.khanhlms.medical_store.repositories.OrderItemRepository;
import com.khanhlms.medical_store.repositories.OrderRepository;
import com.khanhlms.medical_store.repositories.ReviewRepository;
import com.khanhlms.medical_store.repositories.UserRepository;
import com.khanhlms.medical_store.utills.StringUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class ReviewSerevice {
    ReviewRepository reviewRepository;
    UserRepository userRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    ReviewMapper reviewMapper;
    public ReviewResponse handCreateReview(String username, CreateReviewRequest createReviewRequest){

        String orderId = createReviewRequest.getOrder_id();
        String itemId  = createReviewRequest.getItem_id(); 
        UserEntity userEntity =  this.userRepository.findByUsername(username).get();
        if (StringUtils.isBlank(itemId) || StringUtils.isBlank(orderId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        OrderEntity orderEntity = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXIST));

        OrderItemEntity orderItemEntity = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_ITEM_NOT_EXITS));

        if (orderEntity.getOrderItems().contains(orderItemEntity) == false){
            throw new AppException(ErrorCode.INVALID_REQUEST); 
        }
        if (orderEntity.getUser().equals(userEntity) == false){
            throw new AppException(ErrorCode.UNAUTHORIZED_EXCEPTION);
        }
        if (!orderItemEntity.getCommented()){
            ReviewEntity entity = this.reviewMapper.toEntity(createReviewRequest);
            entity.setUser(userEntity);
            entity.setProduct(orderItemEntity.getProduct());
            entity.setOrderItem(orderItemEntity);
            this.reviewRepository.save(entity);
            orderItemEntity.setCommented(true);
            this.orderItemRepository.save(orderItemEntity);

            return this.reviewMapper.toResponse(entity);
        }
        return null;
    }
}
