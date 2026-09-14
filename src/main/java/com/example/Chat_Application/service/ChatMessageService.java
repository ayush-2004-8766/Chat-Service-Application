package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.ChatMessage;
import com.example.Chat_Application.entity.ChatMessageEntity;
import com.example.Chat_Application.entity.User;
import com.example.Chat_Application.repository.ChatMessageRepository;
import com.example.Chat_Application.repository.RoomMemberRepository;
import com.example.Chat_Application.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final RoomMemberRepository roomMemberRepository; // NAYA
    private final UserRepository userRepository; // NAYA

    public ChatMessageService(
            ChatMessageRepository messageRepository,
            RoomMemberRepository roomMemberRepository,
            UserRepository userRepository
    ) {

        this.messageRepository = messageRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userRepository = userRepository;
    }

    public ChatMessage saveMessage(
            ChatMessage message
    ) {

        ChatMessageEntity entity =
                new ChatMessageEntity();

        entity.setRoomId(
                message.getRoomId()
        );

        entity.setSender(
                message.getSender()
        );

        entity.setContent(
                message.getContent()
        );

        entity.setSentAt(
                LocalDateTime.now()
        );

        messageRepository.save(entity);
        // return message; se theek pehle ye add karein:

        if (message.getContent().toLowerCase().startsWith("@bot")) {
            ChatMessageEntity botReply = new ChatMessageEntity();
            botReply.setRoomId(message.getRoomId());
            botReply.setSender("Doraemon Bot 🐱");
            botReply.setContent("Hello! .🚁");
            botReply.setSentAt(java.time.LocalDateTime.now());

            messageRepository.save(botReply);
        }

        return message;
    }

    // 3. getMessages method ko isse replace karein
    public List<ChatMessageEntity> getMessages(Long roomId, String email) {

        User user = userRepository.findByEmail(email).orElseThrow();

        // SECURITY CHECK: Kya user ne password dalke room join kiya tha?
        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Access Denied: Please join the room first"
            );
        }

        return messageRepository.findByRoomIdOrderBySentAtAsc(roomId);
    }

    // NAYA: Reaction add karne ka service logic
    public void addReactionToMessage(Long messageId, String sender, String emoji, Long roomId) {
        // 1. Database se message dhoondhein
        ChatMessageEntity message = messageRepository.findById(messageId).orElse(null);

        if (message != null) {
            // Reactions ko save karna
            message.setReactions(emoji + " (" + sender + ")");
            messageRepository.save(message);

            // 2. WebSocket ke zariye sabhi ko broadcast karein
            // Note: messagingTemplate ko is service mein inject karna hoga agar pehle se nahi hai
        }
    }

    // NAYA: Messages ko Read mark karne ka service logic
    @Transactional
    public void markMessagesAsRead(Long roomId, String readerName) {
        List<ChatMessageEntity> messages = messageRepository.findByRoomIdOrderBySentAtAsc(roomId);

        for (ChatMessageEntity msg : messages) {
            // Jo message apne khud ke nahi hain aur abhi tak READ nahi hue, unhe update kar do
            if (!msg.getSender().equals(readerName) && !"READ".equals(msg.getStatus())) {
                msg.setStatus("READ");
                messageRepository.save(msg);
            }
        }
    }

}