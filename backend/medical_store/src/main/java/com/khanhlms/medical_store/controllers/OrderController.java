package com.khanhlms.medical_store.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.khanhlms.medical_store.dtos.orders.request.CreateOrderRequest;
import com.khanhlms.medical_store.dtos.orders.request.UpdateStatusOrderRequest;
import com.khanhlms.medical_store.dtos.orders.response.CreateOrderResponse;
import com.khanhlms.medical_store.dtos.orders.response.MonthlyRevenue;
import com.khanhlms.medical_store.dtos.orders.response.OrderResponse;
import com.khanhlms.medical_store.dtos.response.ApiResponse;
import com.khanhlms.medical_store.services.OrderService;
import com.khanhlms.medical_store.utills.AuthenticationUtills;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;



@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("${app.api.prefix}/order")
@Slf4j
public class OrderController {
    AuthenticationUtills  authenticationUtills;
    OrderService orderService;
    @PostMapping("/")
    public ApiResponse<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest order,
                                                        HttpServletRequest request) {
        String username = authenticationUtills.getUserName();

        return ApiResponse.<CreateOrderResponse>builder()
                .code(201)
                .message("Create order successfully")
                .data(this.orderService.createOrder(request, username, order))
                .build();
    }
    @GetMapping("")
    public ApiResponse<List<OrderResponse>> getOrdersForUser(@RequestParam(name = "status", defaultValue = "PENDING") String status) {
        String username = authenticationUtills.getUserName();

        return ApiResponse.<List<OrderResponse>>builder()
            .code(200)
            .message("Get order by user has status: " + status + " successfully!")
            .data(this.orderService.getOrderforUser(username, status))
            .build();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ApiResponse<List<OrderResponse>> getOrders(@RequestParam(name = "status", defaultValue = "ALL") String status) {
        String username = authenticationUtills.getUserName();

        return ApiResponse.<List<OrderResponse>>builder()
            .code(200)
            .message("Get order by user has status: " + status + " successfully!")
            .data(this.orderService.getAllOrder( status))
            .build();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/status")
    public ApiResponse<OrderResponse> updateStatus(@RequestBody UpdateStatusOrderRequest request ) {
        return ApiResponse.<OrderResponse>builder()
            .code(200)
            .message("update status to: " + request.getStatus())
            .data(this.orderService.setOrderStatus(request))
            .build();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/count")
    public ApiResponse<Long> countOrrder() {
        return ApiResponse.<Long>builder()
                .code(200)
                .message("get number order successfully")
                .data(this.orderService.countOrder())
                .build();
    }    
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/revenues")
    public ApiResponse<Double> getRevenue() {
        return ApiResponse.<Double>builder()
                        .code(200)
                        .message("get total revenue successfully!")
                        .data(this.orderService.getTotalRevenue())
                        .build();
    }
    @GetMapping("/revenues/months")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<MonthlyRevenue> getRevenueByMonthly(
            @RequestParam(required = false) Integer year
    ){
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
      
        return ApiResponse.<MonthlyRevenue>builder()
                .code(200)
                .message("get total revenue by month at " + targetYear)
                .data(orderService.getTotalRevenueByMonthly(targetYear))
                .build();
    }
}
