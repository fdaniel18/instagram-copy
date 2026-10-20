package project.InstagramRipOff.auth;

import lombok.RequiredArgsConstructor;
import org.hibernate.usertype.internal.AbstractTimeZoneStorageCompositeUserType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.util.BannedUserException;

import java.util.Map;

@RestController
@RequestMapping("/Instagram/auth")
public class AuthenticationController {

    private final AuthenticationService service;
    @Autowired
    public AuthenticationController(AuthenticationService service)
    {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request)
    {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request)
    {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @ExceptionHandler(BannedUserException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public Map<String, String> handleBannedUserException(BannedUserException ex) {
        return Map.of("message", ex.getMessage());
    }
}
