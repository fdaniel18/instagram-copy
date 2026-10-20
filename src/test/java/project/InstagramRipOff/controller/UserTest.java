package project.InstagramRipOff.controller;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import project.InstagramRipOff.entity.User;
import project.InstagramRipOff.repository.UserRepository;
import project.InstagramRipOff.service.UserService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static project.InstagramRipOff.entity.Role.USER;


@SpringBootTest
public class UserTest {

    @Autowired
    private UserController userController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // unique username for every test, so the tests don't depend on what is already in the database
    private final String username = "test_" + UUID.randomUUID().toString().substring(0, 8);

    @AfterEach
    void cleanUp() {
        userRepository.findByUsername(username).ifPresent(userRepository::delete);
    }

    private User createUser() {
        return userController.addUser(new User(null, username, "pass", username + "@example.com", "0700000000", USER));
    }

    @Test
    void testAddUser() {
        User savedUser = createUser();

        // the user was saved and got an id
        assertNotNull(savedUser);
        assertNotNull(savedUser.getId());

        // the password is stored hashed, not in plain text
        assertNotEquals("pass", savedUser.getPassword());

        // it can be found by username
        Optional<User> foundUser = userRepository.findByUsername(username);
        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getId(), foundUser.get().getId());
    }

    @Test
    public void testRetrieveUserByUsername() {
        createUser();

        User foundUser = userController.getUserByUsername(username);

        assertNotNull(foundUser, "user not found");
        assertEquals(username, foundUser.getUsername());
    }

    @Test
    public void testDeleteUserByUsername() {
        createUser();
        assertTrue(userService.retrieveUserByUsername(username).isPresent(), "user not found");

        String deleteMessage = userService.deleteUserByUsername(username);
        assertTrue(deleteMessage.contains("deleted successfully"));

        // it is really gone
        assertTrue(userService.retrieveUserByUsername(username).isEmpty(), "still found in the database");
    }
}
