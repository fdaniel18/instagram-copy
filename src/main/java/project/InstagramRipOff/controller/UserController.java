package project.InstagramRipOff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.InstagramRipOff.config.JwtService;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import project.InstagramRipOff.entity.Post;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    @ResponseBody
    public List<User> getAllUsers() {
        return this.userService.retrieveUsers();
    }

    @GetMapping("/{id}")
    @ResponseBody
    public User getUserById(@PathVariable Long id) {
        return this.userService.retrieveUserById(id);
    }

    @GetMapping("/{id}/posts")
    @ResponseBody
    public List<Post> getUserPosts(@PathVariable Long id) {
        return this.userService.getUserPosts(id);
    }

    @PostMapping
    @ResponseBody
    public User addUser(@RequestBody User user) {
        return this.userService.addUser(user);
    }

    @PutMapping("/{id}")
    @ResponseBody
    public User updateUser(@PathVariable Long id, @RequestBody User user,@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        user.setId(id);
        return this.userService.updateUser(user,username);
    }

    @PutMapping("/{id}/ban")
    @ResponseBody
    public User toggleUserBan(@PathVariable Long id, @RequestBody Map<String, Boolean> request,@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);

        boolean banned = request.get("banned");
        return this.userService.toggleUserBan(id, banned, username);
    }

    @PutMapping("/{id}/role")
    @ResponseBody
    public User changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> request,@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);

        String role = request.get("role");
        return this.userService.changeUserRole(id, role, username);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public String deleteUserById(@PathVariable Long id) {
        return this.userService.deleteUserById(id);
    }

    @GetMapping("/username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.retrieveUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @DeleteMapping("/username/{username}")
    public String deleteUserByUsername(@PathVariable String username) {
        return userService.deleteUserByUsername(username);
    }

    @GetMapping("/{userId}/post-count")
    public ResponseEntity<Integer> getUserPostCount(@PathVariable Long userId) {
        int postCount = userService.getUserPostCount(userId);
        return ResponseEntity.ok(postCount);
    }

    @GetMapping("/{userId}/comment-count")
    public ResponseEntity<Integer> getUserCommentCount(@PathVariable Long userId) {
        int commentCount = userService.getUserCommentCount(userId);
        return ResponseEntity.ok(commentCount);
    }

    @PostMapping("/{userId}/score/update")
    public ResponseEntity<String> updateUserScore(@PathVariable Long userId, @RequestBody project.InstagramRipOff.model.ScoreUpdatePayload payload) {
        System.out.println("Received score update request for user " + userId + " with change: " + payload.getScoreChange());
        userService.updateUserScore(userId, payload.getScoreChange());
        return ResponseEntity.ok("Score updated");
    }
}
