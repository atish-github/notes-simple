package com.example.notes.service;

import com.example.notes.config.JwtService;
import com.example.notes.dto.AuthRequest;
import com.example.notes.dto.AuthResponse;
import com.example.notes.dto.RegisterRequest;
import com.example.notes.dto.UserSummaryDto;
import com.example.notes.model.Role;
import com.example.notes.model.User;
import com.example.notes.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse authenticate(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getUuid().toString());
        extraClaims.put("preferredName", user.getPreferredName());
        extraClaims.put("role", user.getRole().name());

        String jwtToken = jwtService.generateToken(extraClaims, user);
        long expiresInSeconds = jwtService.getExpirationTime() / 1000;

        UserSummaryDto userSummary = new UserSummaryDto(
                user.getUuid(),
                user.getEmail(),
                user.getPreferredName(),
                user.getRole()
        );

        return new AuthResponse(jwtToken, expiresInSeconds, userSummary);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email '" + email + "' already exists");
        }

        User user = new User(
                request.getPreferredName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", savedUser.getUuid().toString());
        extraClaims.put("preferredName", savedUser.getPreferredName());
        extraClaims.put("role", savedUser.getRole().name());

        String jwtToken = jwtService.generateToken(extraClaims, savedUser);
        long expiresInSeconds = jwtService.getExpirationTime() / 1000;

        UserSummaryDto userSummary = new UserSummaryDto(
                savedUser.getUuid(),
                savedUser.getEmail(),
                savedUser.getPreferredName(),
                savedUser.getRole()
        );

        return new AuthResponse(jwtToken, expiresInSeconds, userSummary);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new UserSummaryDto(user.getUuid(), user.getEmail(), user.getPreferredName(), user.getRole());
    }
}

