package com.example.Chat_Application.controller;

import com.example.Chat_Application.dto.CreateRoomRequest;
import com.example.Chat_Application.dto.CreateRoomResponse;
import com.example.Chat_Application.entity.ChatRoom;
import com.example.Chat_Application.service.ChatRoomService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    public ChatRoomController(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    @PostMapping
    public ResponseEntity<CreateRoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request
    ) {

        return ResponseEntity.ok(
                chatRoomService.createRoom(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {

        return ResponseEntity.ok(
                chatRoomService.getAllRooms()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getRoom(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                chatRoomService.getRoom(id)
        );
    }
}