package com.example.Chat_Application.controller;



import com.example.Chat_Application.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/status")
    public List<Map<String, Object>> getUsersStatus() {
        return userRepository.findAll().stream().map(user -> {

            // Safe and traditional way to create a Map
            Map<String, Object> userMap = new java.util.HashMap<>();
            userMap.put("name", user.getName());
            userMap.put("isOnline", user.isOnline());
            userMap.put("lastSeen", user.getLastSeen() != null ? user.getLastSeen().toString() : "");

            return userMap;

        }).collect(Collectors.toList());
    }
}