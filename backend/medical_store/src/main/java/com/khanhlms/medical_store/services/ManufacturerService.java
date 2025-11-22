package com.khanhlms.medical_store.services;

import com.khanhlms.medical_store.dtos.manufacturer.requests.CreateManufaturerRequest;
import com.khanhlms.medical_store.dtos.manufacturer.requests.UpdateManufacturerRequest;
import com.khanhlms.medical_store.dtos.manufacturer.response.ManufacturerResponse;
import com.khanhlms.medical_store.entities.ManufacturerEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.mapper.ManufacturerMapper;
import com.khanhlms.medical_store.repositories.ManufacturerRepository;
import com.khanhlms.medical_store.utills.ReflexUtills;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ManufacturerService {
    ManufacturerRepository manufacturerRepository;
    ManufacturerMapper manufacturerMapper;

    public ManufacturerResponse handCreateManufacturer(CreateManufaturerRequest request){
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new AppException(ErrorCode.MANUFACTURER_INVALID);
        }
        if (this.manufacturerRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.MANUFACTURER_IS_EXISTED);
        }
        ManufacturerEntity  manufacturerEntity = manufacturerMapper.toEntity(request);
        manufacturerEntity.setActive(true);
        manufacturerEntity.setDeleted(false);
        return this.manufacturerMapper.toResponse(manufacturerRepository.save(manufacturerEntity));
    }
    public List<ManufacturerResponse> getAllManufacturers(){
        List<ManufacturerEntity> manufacturerEntities = manufacturerRepository.findAll();
        return manufacturerEntities.stream()
                .map(item -> manufacturerMapper.toResponse(item))
                .toList();
    }

    public ManufacturerResponse handUpdateManufacturer(String id, UpdateManufacturerRequest request){
        ManufacturerEntity entity = this.manufacturerRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.MANUFACTURER_NOT_FOUND));

        ManufacturerEntity updateEntity = this.manufacturerMapper.toEntity(request);

        ReflexUtills.mergeNonNullFields(entity, updateEntity);
        this.manufacturerRepository.save(entity);
        return  this.manufacturerMapper.toResponse(entity);
    }
}
