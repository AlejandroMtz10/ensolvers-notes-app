package com.app_notes.notes_backend.controller;

import com.app_notes.notes_backend.model.User;
import com.app_notes.notes_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("User name is already in use.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody User user) {
        // If the answer is correct, return a success response
        return ResponseEntity.ok("Login successful for user: " + user.getUsername());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> updatePassword(@RequestBody User userRequest) {
        // Search user by username in the database
        var existingUserOpt = userRepository.findByUsername(userRequest.getUsername());
        
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = existingUserOpt.get();
        
        // Encode the new password and update it in the database
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully.");
    }
}