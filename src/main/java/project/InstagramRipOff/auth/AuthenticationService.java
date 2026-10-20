package project.InstagramRipOff.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.InstagramRipOff.config.JwtService;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.repository.UserRepository;
import project.InstagramRipOff.util.BannedUserException;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getEmail(),
                request.getPhoneNumber()
        );
        repository.save(user);

        var token = jwtService.generateToken(user);
        var userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getPhone_number(), user.getRole().name(), user.getScore());

        return new AuthenticationResponse(token, userDto);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = repository.findByUsername(request.getUsername())
                .orElseThrow();

        if (user.isBanned()) {
            throw new BannedUserException("User is banned!");
        }

        var token = jwtService.generateToken(user);
        var userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getPhone_number(), user.getRole().name(), user.getScore());

        return new AuthenticationResponse(token, userDto);
    }
}