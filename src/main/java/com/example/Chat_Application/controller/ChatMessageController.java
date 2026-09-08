package com.example.Chat_Application.controller;


import com.example.Chat_Application.entity.ChatMessageEntity;
import com.example.Chat_Application.service.ChatMessageService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(
            ChatMessageService chatMessageService
    ) {
        this.chatMessageService =
                chatMessageService;
    }


// Return messages
@GetMapping("/room/{roomId}")
public List<ChatMessageEntity> getMessages(
        @PathVariable Long roomId,
        Authentication authentication // NAYA
) {
    String email = authentication.getName();
    return chatMessageService.getMessages(roomId, email); // Email pass karein
}
}