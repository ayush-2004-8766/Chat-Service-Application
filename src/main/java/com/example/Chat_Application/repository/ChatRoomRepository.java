package com.example.Chat_Application.repository;

import com.example.Chat_Application.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository
        extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByRoomName(String roomName);

    boolean existsByRoomName(String roomName);
}