package com.khanhlms.medical_store.utills;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.*;
import java.util.List;
import java.util.Map;

@Slf4j
public class TestResultExcelExporter {

    public static void exportToExcel(String fileName,
                                     List<Map<String, String>> results,
                                     List<String> headers) {

        Workbook workbook;
        Sheet sheet;

        try {

            File file = new File(fileName);

            // Nếu file tồn tại → mở để append
            if (file.exists()) {
                FileInputStream fis = new FileInputStream(file);
                workbook = new XSSFWorkbook(fis);
                sheet = workbook.getSheet("Results");

                // Nếu thiếu sheet → tạo sheet mới
                if (sheet == null) {
                    sheet = workbook.createSheet("Results");
                    createHeader(sheet, headers);
                }

            } else {
                // File chưa tồn tại → tạo mới
                workbook = new XSSFWorkbook();
                sheet = workbook.createSheet("Results");
                createHeader(sheet, headers);
            }

            // --- Ghi thêm dữ liệu ---
            int rowIdx = sheet.getLastRowNum() + 1; // Ghi tiếp dòng cuối cùng

            for (Map<String, String> r : results) {
                Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < headers.size(); i++) {
                    row.createCell(i).setCellValue(r.get(headers.get(i)));
                }
            }

            try (FileOutputStream fileOut = new FileOutputStream(fileName)) {
                workbook.write(fileOut);
            }
            workbook.close();

            log.info("✅ Appended results to {} successfully.", fileName);

        } catch (Exception e) {
            log.error("❌ Failed to export Excel: {}", e.getMessage());
        }
    }

    // Hàm tạo header
    private static void createHeader(Sheet sheet, List<String> headers) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.size(); i++) {
            headerRow.createCell(i).setCellValue(headers.get(i));
        }
    }
}
