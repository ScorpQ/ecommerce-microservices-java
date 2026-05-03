package com.n11.user_service.service;

import com.n11.user_service.dto.request.LoginRequest;
import com.n11.user_service.dto.request.LoginRequest;
import com.n11.user_service.dto.request.SignupRequest;
import com.n11.user_service.dto.request.UpdateUserRequest;
import com.n11.user_service.dto.response.JwtResponse;
import com.n11.user_service.dto.response.UserResponse;
import jakarta.validation.Valid;

public interface UserService {
    JwtResponse login(@Valid LoginRequest request);
    UserResponse register(SignupRequest request);
    UserResponse update(Long userId, UpdateUserRequest request);
    void delete(Long userId);
}
