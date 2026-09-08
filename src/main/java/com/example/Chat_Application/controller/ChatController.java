package com.example.Chat_Application.controller;

import com.example.Chat_Application.dto.ChatMessage;
import com.example.Chat_Application.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final ChatMessageService chatMessageService;

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(
            ChatMessageService chatMessageService,
            SimpMessagingTemplate messagingTemplate
    ) {

        this.chatMessageService =
                chatMessageService;

        this.messagingTemplate =
                messagingTemplate;
    }

    @MessageMapping("/chat")
    public void sendMessage(
            ChatMessage message
    ) {

        ChatMessage savedMessage =
                chatMessageService
                        .saveMessage(message);

        messagingTemplate.convertAndSend(
                "/topic/room/"
                        + message.getRoomId(),
                savedMessage
        );
    }
}