package com.example.Chat_Application.controller;

import com.example.Chat_Application.dto.CreateRoomRequest;
import com.example.Chat_Application.dto.CreateRoomResponse;
import com.example.Chat_Application.dto.JoinRoomRequest;
import com.example.Chat_Application.entity.ChatRoom;
import com.example.Chat_Application.service.ChatRoomService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ChatRoomController(
            ChatRoomService chatRoomService
    ) {

        this.chatRoomService =
                chatRoomService;
    }


    // =====================================================
    // CREATE ROOM
    // =====================================================

    @PostMapping
    public ResponseEntity<CreateRoomResponse> createRoom(

            @Valid
            @RequestBody
            CreateRoomRequest request,

            Authentication authentication

    ) {

        // JWT se logged-in user's email
        String email =
                authentication.getName();


        return ResponseEntity.ok(

                chatRoomService.createRoom(
                        request,
                        email
                )
        );
    }


    // =====================================================
    // GET ALL ROOMS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {

        return ResponseEntity.ok(
                chatRoomService.getAllRooms()
        );
    }


    // =====================================================
    // GET SINGLE ROOM
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getRoom(

            @PathVariable Long id

    ) {

        return ResponseEntity.ok(
                chatRoomService.getRoom(id)
        );
    }


    // =====================================================
    // JOIN ROOM
    // =====================================================

    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinRoom(
            @PathVariable Long id,
            @Valid @RequestBody JoinRoomRequest request,
            org.springframework.security.core.Authentication authentication // NAYA ADD KIYA: User ki details ke liye
    ) {

        // JWT token se logged-in user ka email get karna
        String email = authentication.getName();

        // Ab hum service ko 3 parameters bhej rahe hain
        chatRoomService.joinRoom(
                id,
                request.getRoomPassword(),
                email
        );

        return ResponseEntity.ok("Joined room successfully");
    }


    // =====================================================
    // DELETE ROOM
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoom(

            @PathVariable Long id,

            Authentication authentication

    ) {

        // JWT se email

        String email =
                authentication.getName();


        chatRoomService.deleteRoom(
                id,
                email
        );


        return ResponseEntity.ok(
                "Room deleted successfully"
        );
    }
}