package com.khanhlms.medical_store.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import com.khanhlms.medical_store.dtos.reviews.request.CreateReviewRequest;
import com.khanhlms.medical_store.dtos.reviews.response.ReviewResponse;
import com.khanhlms.medical_store.entities.ReviewEntity;
import com.khanhlms.medical_store.utills.CloudinaryUtils;

@Mapper(componentModel = "spring")
public abstract class ReviewMapper {
    @Autowired
    protected CloudinaryUtils cloudinaryUtils;  
    
    @Mappings({
        @Mapping(source = "image", target = "imageUrl", qualifiedByName = "mapImage")
    })
    public abstract ReviewEntity toEntity(CreateReviewRequest request);

    public abstract ReviewResponse toResponse(ReviewEntity entity);

    @Named("mapImage")
    protected String mapImage(MultipartFile multipartFile){
        if(multipartFile == null){
            return null;
        }
        return this.cloudinaryUtils.uploadImageCloddy(multipartFile);
    }

}
