package com.khanhlms.medical_store.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_EXISTED(1000,"user existed", HttpStatus.INTERNAL_SERVER_ERROR),
    AUTHENTICATION_EXCEPTION(1111,"authentication exception", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED_EXCEPTION(2222,"unauthorized exception" +
            " {User don't have permission!}", HttpStatus.FORBIDDEN),
    JWT_EXCEPTION(3333, "jwt exception", HttpStatus.UNAUTHORIZED),
    MANUFACTURER_NOT_FOUND(1001, "manufacturer not found exception", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1002, "category not found exception", HttpStatus.BAD_REQUEST),
    EXPIRERATION_EXCEPTION(1003, "the expiration date must be later than the production date ", HttpStatus.BAD_REQUEST),
    ;
    ErrorCode(int code, String message, HttpStatus httpStatus){
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
    private int code;
    private String message;
    private HttpStatus httpStatus;
}

