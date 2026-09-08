package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.ChatMessage;
import com.example.Chat_Application.entity.ChatMessageEntity;
import com.example.Chat_Application.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;

    public ChatMessageService(
            ChatMessageRepository messageRepository
    ) {

        this.messageRepository = messageRepository;
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

    public List<ChatMessageEntity>
    getMessages(Long roomId) {

        return messageRepository
                .findByRoomIdOrderBySentAtAsc(
                        roomId
                );
    }
}