package com.eshop.backend.controller;

import com.eshop.backend.model.User;
import com.eshop.backend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Email and password are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "User already exists"));
        }

        User user = userRepository.save(new User(email, password));
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmailAndPassword(email, password);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid email or password"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("user", userOpt.get());

        return ResponseEntity.ok(response);
    }

    /**
     * Google Sign-In via Firebase:
     * 1. Frontend sends the Firebase ID token here.
     * 2. Backend verifies it with Firebase Admin SDK.
     * 3. If user doesn't exist, auto-creates them.
     * 4. Returns the user info (same as regular login response).
     */
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");

        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Firebase ID token is required"));
        }

        try {
            // Verify the token with Firebase Admin SDK
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String name  = decodedToken.getName();

            // Find or create the user
            Optional<User> existing = userRepository.findByEmail(email);
            User user;
            if (existing.isPresent()) {
                user = existing.get();
            } else {
                user = new User(email, name, "GOOGLE");
                user = userRepository.save(user);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Google login successful");
            response.put("user", user);
            return ResponseEntity.ok(response);

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid Firebase token: " + e.getMessage()));
        }
    }
}

