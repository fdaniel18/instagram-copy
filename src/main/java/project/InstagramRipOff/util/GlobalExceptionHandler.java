package project.InstagramRipOff.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BannedUserException.class)
    public ResponseEntity<String> handleBannedUser(BannedUserException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN) // 403
                .body(ex.getMessage());
    }


}
