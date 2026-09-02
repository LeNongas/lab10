package com.example.registration_service.controller;

import com.example.registration_service.dto.RegistrationRequestDTO;
import com.example.registration_service.entity.Registration;
import com.example.registration_service.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    // Buổi 9:
    // Lấy danh sách môn học đã đăng ký của sinh viên đang đăng nhập
    @GetMapping("/my")
    public List<Registration> getMyRegistrations(
            Authentication authentication
    ) {
        Long studentId =
                (Long) authentication.getCredentials();

        return registrationService
                .getMyRegistrations(studentId);
    }

    // Đăng ký học phần
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Registration register(
            @Valid @RequestBody RegistrationRequestDTO dto
    ) {
        return registrationService.register(dto);
    }

    // Hủy đăng ký học phần
    @DeleteMapping("/{id}")
    public void cancel(@PathVariable Long id) {
        registrationService.cancel(id);
    }
}