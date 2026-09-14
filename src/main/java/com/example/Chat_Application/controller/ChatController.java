package com.example.Chat_Application.controller;

import com.example.Chat_Application.dto.ChatMessage;
import com.example.Chat_Application.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Controller
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(
            ChatMessageService chatMessageService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat")
    public void sendMessage(ChatMessage message) {

        // AGAR MESSAGE IMAGE HAI, TOH USE SERVER PAR FOLDER MEIN SAVE KAREIN
        if ("IMAGE".equals(message.getType())) {
            try {
                String base64Data = message.getContent();

                // Base64 header hataana (e.g., "data:image/png;base64,...")
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }

                // Decode karke bytes banana
                byte[] imageBytes = Base64.getDecoder().decode(base64Data);

                // Unique filename generate karna
                String fileName = UUID.randomUUID().toString() + ".jpg";

                // 'uploads/' folder create karna agar na ho
                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                // File ko local folder mein write karna
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, imageBytes);

                // Database mein save hone ke liye content mein sirf file path set kar diya
                message.setContent("/uploads/" + fileName);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Message ko database mein save karke sabhi connected users ko broadcast karein
        ChatMessage savedMessage = chatMessageService.saveMessage(message);
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), savedMessage);
    }

    // NAYA: Typing Indicator Mapping
    @MessageMapping("/typing")
    public void handleTyping(Map<String, Object> typingPayload) {
        Long roomId = Long.valueOf(typingPayload.get("roomId").toString());

        // Room ke sabhi users ko bhej do ki kaun type kar raha hai
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", typingPayload);
    }

    // NAYA: Message Reaction Mapping
    @MessageMapping("/react")
    public void handleReaction(Map<String, Object> reactionPayload) {
        Long messageId = Long.valueOf(reactionPayload.get("messageId").toString());
        String emoji = reactionPayload.get("emoji").toString();
        String sender = reactionPayload.get("sender").toString();
        Long roomId = Long.valueOf(reactionPayload.get("roomId").toString());

        // Message ko database se dhoondhein aur reactions update karein
        chatMessageService.addReactionToMessage(messageId, sender, emoji, roomId);
    }

    // ChatController.java ke andar

    @PostMapping("/api/chat/messages/read/{roomId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long roomId, @RequestParam String readerName) {
        chatMessageService.markMessagesAsRead(roomId, readerName);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/read", readerName);
        return ResponseEntity.ok().build();
    }
}