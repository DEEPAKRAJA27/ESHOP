package com.eshop.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/message")
    public Map<String, String> getMessage() {
        return Collections.singletonMap("message", "Backend + PostgreSQL Connected 🚀 (Spring Boot)");
    }
}
