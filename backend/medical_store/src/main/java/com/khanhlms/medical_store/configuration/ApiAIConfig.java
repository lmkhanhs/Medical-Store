package com.khanhlms.medical_store.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiAIConfig {

    @Value("${app.api.prefixAI}")
    private String aiServer;

    public static final String PREDICT_API = "/api/predict/";

    public String getPredictEndpoint() {
        return aiServer + PREDICT_API;
    }
}
