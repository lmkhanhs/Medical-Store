package com.khanhlms.medical_store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.dtos.requests.auth.LoginRequest;
import com.khanhlms.medical_store.dtos.response.auth.LoginResponse;
import com.khanhlms.medical_store.services.AuthenticationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Slf4j
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthenticationService authenticationService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        AuthenticationService authenticationService() {
            return mock(AuthenticationService.class);
        }
    }
    private static final List<Map<String, String>> results = new ArrayList<>();


    @Test
    void testLoginSuccess() throws Exception {

        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("12345678")
                .build();

        LoginResponse response = LoginResponse.builder()
                .tokenType("Bearer")
                .accessToken("fakeAccessToken")
                .expiresIn(6000)
                .refreshToken("fakeRefreshToken")
                .build();

        // ✅ Fix quan trọng
        when(authenticationService.hanlelogin(Mockito.any(LoginRequest.class)))
                .thenReturn(response);

        try {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.message").value("Login Successful"))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.data.accessToken").value("fakeAccessToken"))
                    .andExpect(jsonPath("$.data.expiresIn").value(6000))
                    .andExpect(jsonPath("$.data.refreshToken").value("fakeRefreshToken"));
            addResult("testLoginSuccess", "PASSED", "");
        } catch (AssertionError e) {
            addResult("testLoginSuccess", "FAILED", e.getMessage());
            throw e; // vẫn ném ra để IntelliJ hiển thị fail đúng
        }
    }
    private static void addResult(String testName, String status, String message) {
        Map<String, String> record = new HashMap<>();
        record.put("Test Name", testName);
        record.put("Status", status);
        record.put("Message", message);
        results.add(record);
    }

    @AfterAll
    static void exportTestResults() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Test Results");
        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Test Name");
        header.createCell(1).setCellValue("Status");
        header.createCell(2).setCellValue("Message");

        int rowIdx = 1;
        for (Map<String, String> result : results) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(result.get("Test Name"));
            row.createCell(1).setCellValue(result.get("Status"));
            row.createCell(2).setCellValue(result.get("Message"));
        }

        try (FileOutputStream fileOut = new FileOutputStream("test-result.xlsx")) {
            workbook.write(fileOut);
            log.info("The test execution has completed successfully");
            log.info("Written test-result.xlsx successfully");
        }
    }
}
