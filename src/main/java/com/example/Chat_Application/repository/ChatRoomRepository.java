package com.example.Chat_Application.repository;

import com.example.Chat_Application.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository
        extends JpaRepository<ChatRoom, Long> {

    boolean existsByRoomName(String roomName);
}