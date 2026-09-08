package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.CreateRoomRequest;
import com.example.Chat_Application.dto.CreateRoomResponse;
import com.example.Chat_Application.entity.ChatRoom;
import com.example.Chat_Application.repository.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomService(
            ChatRoomRepository chatRoomRepository
    ) {

        this.chatRoomRepository = chatRoomRepository;
    }

    public CreateRoomResponse createRoom(
            CreateRoomRequest request
    ) {

        if (
                chatRoomRepository
                        .existsByRoomName(
                                request.getRoomName()
                        )
        ) {

            throw new RuntimeException(
                    "Room already exists"
            );
        }

        ChatRoom room = new ChatRoom();

        room.setRoomName(
                request.getRoomName()
        );

        room.setCreatedAt(
                LocalDateTime.now()
        );

        ChatRoom saved =
                chatRoomRepository.save(room);

        return new CreateRoomResponse(
                saved.getId(),
                saved.getRoomName()
        );
    }

    public List<ChatRoom> getAllRooms() {

        return chatRoomRepository.findAll();
    }

    public ChatRoom getRoom(Long id) {

        return chatRoomRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Room not found"
                        )
                );
    }
}