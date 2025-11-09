package com.khanhlms.medical_store.model;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TestManufacturerModel {
    String testCaseID;
    String testCaseDescription;
    String name;
    String token;
    Integer expectedStatus;
    String expectedMessage;
}