package com.example.authservice.service;

import com.example.authservice.dto.LoginRequestDTO;
import com.example.authservice.dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO dto);
}
