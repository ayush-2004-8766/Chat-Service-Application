package com.example.Chat_Application.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    // Reaction ke liye naya field (e.g., {"Ayush": "👍", "Rahul": "❤️"})
    @Column(columnDefinition = "TEXT")
    private String reactions;

    // ChatMessageEntity.java ke andar
    private String status = "SENT"; // Default sent rahega

    @Column(nullable = false)
    private LocalDateTime sentAt;

    //public String getStatus() { return status; }
    //public void setStatus(String status) { this.status = status; }
   }