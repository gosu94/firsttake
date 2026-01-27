package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.AuthDtos;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public AuthDtos.MessageResponse handleIllegalArgument(IllegalArgumentException ex) {
        return new AuthDtos.MessageResponse(ex.getMessage());
    }
}
