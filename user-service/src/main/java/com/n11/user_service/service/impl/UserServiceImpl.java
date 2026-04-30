package com.n11.user_service.service.impl;

import com.n11.user_service.client.KeycloakClient;
import com.n11.user_service.dto.request.LoginRequest;
import com.n11.user_service.dto.request.SignupRequest;
import com.n11.user_service.dto.request.UpdateUserRequest;
import com.n11.user_service.dto.response.JwtResponse;
import com.n11.user_service.dto.response.UserResponse;
import com.n11.user_service.entity.User;
import com.n11.user_service.exception.UserNotFoundException;
import com.n11.user_service.mapper.UserMapper;
import com.n11.user_service.repository.UserRepository;
import com.n11.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
public class UserServiceImpl implements UserService {

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final KeycloakClient keycloakClient;

    public UserServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder,
                           KeycloakClient keycloakClient) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.keycloakClient = keycloakClient;
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException(request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = fetchTokenFromKeycloak(request.getUsername(), request.getPassword());
        return new JwtResponse(accessToken, userMapper.toResponse(user));
    }

    @Override
    public UserResponse register(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) throw new UserNotFoundException(userId);
        userRepository.deleteById(userId);
    }

    private String fetchTokenFromKeycloak(String username, String password) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "password");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("username", username);
        params.add("password", password);

        return keycloakClient.getToken(params).getAccessToken();
    }
}
