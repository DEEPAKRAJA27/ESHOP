package com.eshop.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            String serviceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");

            InputStream serviceAccount;
            if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
                // Load from environment variable (used in production on Render)
                serviceAccount = new ByteArrayInputStream(serviceAccountJson.getBytes());
            } else {
                // Load from classpath file (used locally)
                serviceAccount = getClass().getClassLoader()
                        .getResourceAsStream("firebase-service-account.json");
            }

            if (serviceAccount == null) {
                System.out.println("WARNING: Firebase service account not found. Google login will be unavailable.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase Admin SDK initialized successfully.");
        }
    }
}
