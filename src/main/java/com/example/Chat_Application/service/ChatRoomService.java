package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.CreateRoomRequest;
import com.example.Chat_Application.dto.CreateRoomResponse;
import com.example.Chat_Application.entity.ChatRoom;
import com.example.Chat_Application.entity.RoomMember;
import com.example.Chat_Application.entity.User;
import com.example.Chat_Application.repository.ChatRoomRepository;
import com.example.Chat_Application.repository.RoomMemberRepository;
import com.example.Chat_Application.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final RoomMemberRepository roomMemberRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ChatRoomService(
            ChatRoomRepository chatRoomRepository,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RoomMemberRepository roomMemberRepository
    ) {

        this.chatRoomRepository = chatRoomRepository;

        this.passwordEncoder = passwordEncoder;

        this.userRepository = userRepository;

        this.roomMemberRepository = roomMemberRepository;
    }


    // =====================================================
    // CREATE ROOM
    // =====================================================

    public CreateRoomResponse createRoom(
            CreateRoomRequest request,
            String email
    ) {

        // =================================================
        // CHECK ROOM ALREADY EXISTS
        // =================================================

        if (
                chatRoomRepository.existsByRoomName(
                        request.getRoomName()
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Room already exists"
            );
        }


        // =================================================
        // FIND LOGGED-IN USER
        // =================================================

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found"
                                )
                        );


        // =================================================
        // CREATE ROOM OBJECT
        // =================================================

        ChatRoom room = new ChatRoom();


        // =================================================
        // ROOM NAME
        // =================================================

        room.setRoomName(
                request.getRoomName()
        );


        // =================================================
        // ROOM PASSWORD
        // =================================================

        /*
         * Original password:
         *
         * 1234
         *
         * DB:
         *
         * $2a$10$........
         */

        room.setRoomPassword(
                passwordEncoder.encode(
                        request.getRoomPassword()
                )
        );


        // =================================================
        // ROOM OWNER
        // =================================================

        room.setOwnerId(
                user.getId()
        );


        // =================================================
        // CREATED TIME
        // =================================================

        room.setCreatedAt(
                LocalDateTime.now()
        );


        // =================================================
        // SAVE ROOM
        // =================================================

        ChatRoom savedRoom =
                chatRoomRepository.save(room);


        // =================================================
        // RETURN RESPONSE
        // =================================================

        return new CreateRoomResponse(
                savedRoom.getId(),
                savedRoom.getRoomName()
        );
    }


    // =====================================================
    // GET ALL ROOMS
    // =====================================================

    public List<ChatRoom> getAllRooms() {

        return chatRoomRepository.findAll();
    }


    // =====================================================
    // GET SINGLE ROOM
    // =====================================================

    public ChatRoom getRoom(Long id) {

        return chatRoomRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Room not found"
                        )
                );
    }


    // =====================================================
    // JOIN ROOM
    // =====================================================
    // 3. joinRoom method ko isse replace karein
    public void joinRoom(Long roomId, String roomPassword, String email) {

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        boolean passwordMatches = passwordEncoder.matches(roomPassword, room.getRoomPassword());

        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid room password");
        }

        // --- NAYA LOGIC: USER KO MEMBER BANAYEIN ---
        User user = userRepository.findByEmail(email).orElseThrow();

        if (!roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            RoomMember member = new RoomMember();
            member.setRoomId(room.getId());
            member.setUserId(user.getId());
            roomMemberRepository.save(member);
        }
    }


    // FOR DELETING ROOM

    public void deleteRoom(
            Long roomId,
            String email) {

        ChatRoom room =
                chatRoomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Room not found"
                                )
                        );

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User not found"
                                )
                        );

        System.out.println(
                "Logged-in User ID: " + user.getId()
        );

        System.out.println(
                "Room Owner ID: " + room.getOwnerId()
        );

        if (room.getOwnerId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This room has no owner. Please recreate the room."
            );
        }

        if (!room.getOwnerId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not the owner of this room."
            );
        }

        chatRoomRepository.delete(room);
    }

}