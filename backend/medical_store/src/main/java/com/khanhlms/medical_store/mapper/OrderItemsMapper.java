package com.khanhlms.medical_store.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;

import com.khanhlms.medical_store.dtos.orders.response.OrderItem;
import com.khanhlms.medical_store.entities.OrderItemEntity;
import com.khanhlms.medical_store.entities.ProductsEntity;

@Mapper(componentModel = "spring")
public abstract class OrderItemsMapper {
    @Mapping(source = "product.name", target = "name")
    @Mapping(source = "product.originPrice", target = "originPrice")
    @Mapping(source = "product", target = "imageUrl", qualifiedByName = "mapImage")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "discountPrice", target = "discountPrice")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "total", target = "total")

    public abstract OrderItem toOrderItem(OrderItemEntity orderItem);

    @Named("mapImage")
    protected String mapImage(ProductsEntity product) {
        if (product == null || product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().get(0).getImageUrl();
    }
}
