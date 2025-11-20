package com.khanhlms.medical_store.controllers;

import com.khanhlms.medical_store.configuration.VnPayConfig;
import com.khanhlms.medical_store.entities.PaymentEntity;
import com.khanhlms.medical_store.exceptions.AppException;
import com.khanhlms.medical_store.exceptions.ErrorCode;
import com.khanhlms.medical_store.repositories.PaymentRepository;
import com.khanhlms.medical_store.utills.HMACutill;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Controller
@RequestMapping("${app.api.prefix}/payment")
@RequiredArgsConstructor
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    VnPayConfig  vnPayConfig;
    private final PaymentRepository paymentRepository;

    @GetMapping("/vnpay/return")
    public String VnpayReturn(HttpServletRequest request, Model model) throws UnsupportedEncodingException {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldName.startsWith("vnp_")) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = fields.remove("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
            model.addAttribute("error", "Thiếu chữ ký.");
            return "payment-failed";
        }

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String value = fields.get(fieldName);
            if (value != null && !value.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()))
                        .append('&');
            }
        }

        if (hashData.length() > 0) {
            hashData.deleteCharAt(hashData.length() - 1);
        }

        String checkHash = HMACutill.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());

        if (!checkHash.equalsIgnoreCase(vnp_SecureHash)) {
            model.addAttribute("error", "Chữ ký không hợp lệ.");
            return "payment-failed";
        }

        String vnp_ResponseCode = fields.get("vnp_ResponseCode");
        String vnp_TxnRef = fields.get("vnp_TxnRef");
        String vnp_Amount = fields.get("vnp_Amount");
        String vnp_PayDate = fields.get("vnp_PayDate");
        String vnp_TransactionNo = fields.get("vnp_TransactionNo");
        // check transactionNo
        // var status =
        // this.paymentRepository.findByTransactionId(vnp_TransactionNo).isPresent();
        // if(status){
        // model.addAttribute("error", "Thanh toán thất bại");
        // return "payment-failed";
        // }
        String paymentCode = vnp_TxnRef; // Txn_ref is paymentID
        PaymentEntity paymentEntity = paymentRepository.findById(paymentCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_EXIST));

        if ("00".equals(vnp_ResponseCode)) {
            model.addAttribute("transactionId", vnp_TransactionNo);
            model.addAttribute("amount", formatAmount(vnp_Amount));
            model.addAttribute("paymentTime", formatPayDate(vnp_PayDate));
            // TODO
            return "vnpay-success";
        } else {
//            paymentEntity.setStatus(PaymentStatus.FAILED.toString());
//            this.paymentRepository.save(paymentEntity);
//            //
//            BookingEntity booking = paymentEntity.getBooking();
//            booking.setBookingStatus(BookingStatus.FAILED.toString());
//            this.bookingRepository.save(booking);
//            model.addAttribute("error", "Thanh toán thất bại. Mã lỗi: " + vnp_ResponseCode);
            return "payment-failed";
        }
    }

    private String formatAmount(String rawAmount) {
        long amount = Long.parseLong(rawAmount) / 100;
        return String.format("%,d VND", amount).replace(",", ".");
    }

    private String formatPayDate(String payDate) {
        try {
            SimpleDateFormat input = new SimpleDateFormat("yyyyMMddHHmmss");
            SimpleDateFormat output = new SimpleDateFormat("dd/MM/yyyy - HH:mm");
            return output.format(input.parse(payDate));
        } catch (Exception e) {
            return "Không xác định";
        }
    }
}
