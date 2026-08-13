package com.example.registration_service.service;

import com.example.registration_service.dto.RegistrationRequestDTO;
import com.example.registration_service.entity.Registration;

public interface RegistrationService {
    Registration register(RegistrationRequestDTO dto);

    void cancel(Long registrationId);
}
