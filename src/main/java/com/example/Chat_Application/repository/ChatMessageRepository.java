package com.example.Chat_Application.repository;

import com.example.Chat_Application.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity>
    findByRoomIdOrderBySentAtAsc(Long roomId);
}