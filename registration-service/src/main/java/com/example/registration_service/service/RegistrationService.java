package com.example.registration_service.service;

import com.example.registration_service.dto.RegistrationRequestDTO;
import com.example.registration_service.entity.Registration;

import java.util.List;

public interface RegistrationService {

    // Đăng ký học phần
    Registration register(RegistrationRequestDTO dto);

    // Hủy đăng ký học phần
    void cancel(Long registrationId);

    // Buổi 9:
    // Lấy danh sách đăng ký của sinh viên đang đăng nhập
    List<Registration> getMyRegistrations(Long studentId);
}