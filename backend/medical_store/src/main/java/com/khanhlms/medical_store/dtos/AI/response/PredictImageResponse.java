package com.khanhlms.medical_store.dtos.AI.response;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PredictImageResponse {
    private String englishName;
    private String vietnameseName;
    private double confidence;
}
