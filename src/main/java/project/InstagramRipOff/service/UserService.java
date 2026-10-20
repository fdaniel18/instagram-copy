package project.InstagramRipOff.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import project.InstagramRipOff.entity.Post;
import project.InstagramRipOff.entity.Role;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.repository.PostRepository;
import project.InstagramRipOff.repository.UserRepository;
import project.InstagramRipOff.repository.CommentRepository;
import project.InstagramRipOff.util.EmailSender;
import project.InstagramRipOff.util.TwilioSmsSender;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private EmailSender emailSender;

    @Autowired
    private TwilioSmsSender twilioSmsSender;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);


    public List<User> retrieveUsers() {
        return (List<User>) this.userRepository.findAll();
    }


    public User retrieveUserById(Long id) {
        Optional<User> user = this.userRepository.findById(id);

        return user.orElse(null);
    }
    public List<Post> getUserPosts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return postRepository.findAllByUser_IdOrderByDateTimeDesc(userId);
    }

    public int getUserPostCount(Long userId) {
        return postRepository.countByUser_Id(userId);
    }

    public int getUserCommentCount(Long userId) {
        return commentRepository.countByUser_Id(userId);
    }

    public User addUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return this.userRepository.save(user);
    }


    public User updateUser(User user, String adminUsername) {
        if(user == null) {
            throw new RuntimeException("User doesn't exist.");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow users to update their own profile or admins to update any profile
        if (!admin.getUsername().equals(user.getUsername()) && !admin.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("You don't have the permission to edit this!.");
        }

        // Get the existing user to preserve the password
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only the allowed fields
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone_number(user.getPhone_number());

        // Save the updated user
        return userRepository.save(existingUser);
    }


    public String deleteUserById(Long id) {
        try {
            this.userRepository.deleteById(id);
            return "User deleted successfully!";
        } catch (Exception e) {
            return "Failed to delete user with id: " + id;
        }
    }

    public Optional<User> retrieveUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public String deleteUserByUsername(String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isPresent()) {
            userRepository.delete(optionalUser.get());
            return "User with username " + username + " deleted successfully.";
        } else {
            return "User with username " + username + " not found.";
        }
    }

    public User toggleUserBan(Long userId, boolean banned, String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!admin.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("You don't have the permission to ban this user.");
        }
        if (admin.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot ban yourself.");
        }

        user.setBanned(banned);
        User updatedUser = userRepository.save(user);

        if (banned) {
            try {
                emailSender.sendEmail(
                        user.getEmail(),
                        "Account Banned!",
                        "Dear " + user.getUsername() + ",\nYour account has been banned by an administrator. If you believe this was a mistake, please contact support.\n\nRegards,\nInstagramRipOff Team"
                );
            } catch (Exception e) {
                System.err.println("Email failed: " + e.getMessage());
            }

            try {
                twilioSmsSender.sendSms(
                        user.getPhone_number(),
                        "Dear " + user.getUsername() + ",\nYour account has been banned by an administrator. If you believe this was a mistake, please contact support.\n\nInstagramRipOff Team"
                );
            } catch (Exception e) {
                System.err.println("SMS failed: " + e.getMessage());
            }
        }

        return updatedUser;
    }


    public User changeUserRole(Long userId, String role, String adminUsername) {

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!admin.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("You don't have the permission to ban this user!.");
        }

        try {
            Role newRole = Role.valueOf(role);
            user.setRole(newRole);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    public void updateUserScore(Long userId, double scoreChange) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setScore(user.getScore() + scoreChange);
        userRepository.save(user);
        System.out.println("User " + userId + " score updated by " + scoreChange + ". New score: " + user.getScore());
    }
}