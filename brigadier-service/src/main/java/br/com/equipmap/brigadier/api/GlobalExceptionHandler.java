package br.com.equipmap.brigadier.api;

import br.com.equipmap.core.error.ApiException;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ProblemResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemResponse> apiException(ApiException exception, HttpServletRequest request) {
        return ResponseEntity.status(exception.statusCode()).body(exception.toProblemResponse(traceId(request)));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemResponse> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<ErrorDetail> details = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ErrorDetail(error.getField(), error.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest().body(ProblemResponse.of(400, "BAD_REQUEST", "Validation failed", details, traceId(request)));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemResponse> generic(Exception exception, HttpServletRequest request) {
        return ResponseEntity.status(500).body(ProblemResponse.of(500, "INTERNAL_SERVER_ERROR", "Unexpected error", List.of(), traceId(request)));
    }

    private String traceId(HttpServletRequest request) {
        String traceId = request.getHeader(br.com.equipmap.core.constants.HttpHeaders.TRACE_ID);
        return traceId == null || traceId.isBlank() ? request.getRequestId() : traceId;
    }
}
