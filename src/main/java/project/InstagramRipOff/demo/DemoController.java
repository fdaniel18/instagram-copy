package project.InstagramRipOff.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Instagram/auth/demo")
public class DemoController {

    @GetMapping
    public ResponseEntity<String> test()
    {
        return ResponseEntity.ok("Secure endpoint!");
    }
}
