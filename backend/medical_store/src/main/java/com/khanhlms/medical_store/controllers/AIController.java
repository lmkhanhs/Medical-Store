package com.khanhlms.medical_store.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.configuration.ApiAIConfig;
import com.khanhlms.medical_store.dtos.AI.response.PredictImageResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("${app.api.prefix}/ai")
@RequiredArgsConstructor
public class AIController {

    private final ApiAIConfig apiAIConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/predict")
    public ApiResponse<PredictImageResponse> predictImage(@RequestParam("file") MultipartFile file) throws Exception {

        File temp = File.createTempFile("upload-", file.getOriginalFilename());
        file.transferTo(temp);

        String url = apiAIConfig.getPredictEndpoint();
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(temp));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        // Xóa file tạm
        temp.delete();

        // Parse JSON trả về từ FastAPI
        JsonNode json = objectMapper.readTree(response.getBody());

        PredictImageResponse result = PredictImageResponse.builder()
                .englishName(json.get("name_en").asText())
                .vietnameseName(json.get("name_vi").asText())
                .confidence(json.get("confidence").asDouble())
                .build();

        return ApiResponse.<PredictImageResponse>builder()
                .code(200)
                .message("Predict Image")
                .data(result)
                .build();
    }
}
