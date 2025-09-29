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

