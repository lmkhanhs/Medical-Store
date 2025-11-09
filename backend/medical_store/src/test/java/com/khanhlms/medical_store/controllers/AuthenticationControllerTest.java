package com.khanhlms.medical_store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khanhlms.medical_store.dtos.requests.auth.LoginRequest;
import com.khanhlms.medical_store.dtos.response.auth.LoginResponse;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.model.TestLoginModel;
import com.khanhlms.medical_store.services.AuthenticationService;
import com.khanhlms.medical_store.utills.ExcelUtils;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileOutputStream;
import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Slf4j
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthenticationService authenticationService;

    List<TestLoginModel> loginTestCases = new ArrayList<>();
    private final List<Map<String, String>> results = new ArrayList<>();

    @TestConfiguration
    static class TestConfig {
        @Bean
        AuthenticationService authenticationService() {
            return mock(AuthenticationService.class);
        }
    }

    @BeforeAll
    void setup() {
        loginTestCases = ExcelUtils.readLoginTestData("/data_login_test.xlsx");
    }

    @Test
    void testLoginWithExcelData() throws Exception {

        for (TestLoginModel testCase : loginTestCases) {

            LoginRequest request = LoginRequest.builder()
                    .username(testCase.getUsername())
                    .password(testCase.getPassword())
                    .build();

            switch (testCase.getExpectedStatus()) {
                case 200 ->
                        when(authenticationService.hanlelogin(Mockito.any(LoginRequest.class)))
                                .thenReturn(LoginResponse.builder().build());

                case 401 ->
                        when(authenticationService.hanlelogin(Mockito.any(LoginRequest.class)))
                                .thenThrow(new AppException(ErrorCode.AUTHENTICATION_EXCEPTION));

                case 403 ->
                        when(authenticationService.hanlelogin(Mockito.any(LoginRequest.class)))
                                .thenThrow(new AppException(ErrorCode.USER_IS_LOOKED));

                default ->
                        when(authenticationService.hanlelogin(Mockito.any(LoginRequest.class)))
                                .thenThrow(new AppException(ErrorCode.INVALID_REQUEST));
            }

            try {
                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().is(testCase.getExpectedStatus()))
                        .andExpect(jsonPath("$.message")
                                .value(org.hamcrest.Matchers.equalToIgnoringCase(testCase.getExpectedMessage().trim())));

                addResult(testCase, "PASSED", testCase.getExpectedMessage());


            } catch (AssertionError e) {
                addResult(testCase, "FAILED", e.getMessage());

            }
        }
    }


    private void addResult(TestLoginModel testCase, String status, String msg) {
        Map<String, String> record = new HashMap<>();
        record.put("Test Name", testCase.getTestCaseID());
        record.put("Description", testCase.getTestCaseDescription());
        record.put("Status", status);
        record.put("Message", msg);
        results.add(record);
    }


    @AfterAll
    void exportResults() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Results");
        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Test Name");
        header.createCell(1).setCellValue("Description");
        header.createCell(2).setCellValue("Status");
        header.createCell(3).setCellValue("Message");


        int rowIdx = 1;
        for (Map<String, String> r : results) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(r.get("Test Name"));
            row.createCell(1).setCellValue(r.get("Description"));
            row.createCell(2).setCellValue(r.get("Status"));
            row.createCell(3).setCellValue(r.get("Message"));
        }


        try (FileOutputStream fileOut = new FileOutputStream("test-result.xlsx")) {
            workbook.write(fileOut);
        }
        workbook.close();
        log.info("✅ Exported test-result.xlsx successfully.");
    }

}
