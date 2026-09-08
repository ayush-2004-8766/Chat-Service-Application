package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.ChatMessage;
import com.example.Chat_Application.entity.ChatMessageEntity;
import com.example.Chat_Application.entity.User;
import com.example.Chat_Application.repository.ChatMessageRepository;
import com.example.Chat_Application.repository.RoomMemberRepository;
import com.example.Chat_Application.repository.UserRepository;
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

}