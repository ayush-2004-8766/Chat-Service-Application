package com.example.Chat_Application.service;

import com.example.Chat_Application.dto.LoginRequest;
import com.example.Chat_Application.dto.LoginResponse;
import com.example.Chat_Application.dto.RegisterRequest;
import com.example.Chat_Application.entity.User;
import com.example.Chat_Application.repository.UserRepository;
import com.example.Chat_Application.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public String register(
            RegisterRequest request
    ) {

        if (
                userRepository
                        .existsByEmail(request.getEmail())
        ) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(request.getName());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        userRepository.save(user);

        return "Registration successful";
    }

    public LoginResponse login(
            LoginRequest request
    ) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user =
                userRepository
                        .findByEmail(request.getEmail())
                        .orElseThrow();

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail()
        );
    }
}