package com.example.Chat_Application.config;

import com.example.Chat_Application.entity.User;
import com.example.Chat_Application.repository.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
public class WebSocketEventListener {

    private final UserRepository userRepository;

    public WebSocketEventListener(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        // 1. Frontend se bheja gaya email nikalna
        String email = accessor.getFirstNativeHeader("user-email");

        if (email != null) {
            // 2. Session mein email save kar liya taaki disconnect hone par yaad rahe
            accessor.getSessionAttributes().put("email", email);

            // 3. Database update: isOnline = true
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setOnline(true);
                userRepository.save(user);
                System.out.println(email + " is now ONLINE 🟢");
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        // 1. Session se email wapas nikalna
        String email = (String) accessor.getSessionAttributes().get("email");

        if (email != null) {
            // 2. Database update: isOnline = false aur lastSeen = current time
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setOnline(false);
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
                System.out.println(email + " is now OFFLINE 🔴");
            });
        }
    }
}