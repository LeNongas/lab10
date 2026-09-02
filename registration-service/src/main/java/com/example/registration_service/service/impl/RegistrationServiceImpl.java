package com.example.registration_service.service.impl;

import com.example.registration_service.client.CourseClient;
import com.example.registration_service.dto.RegistrationRequestDTO;
import com.example.registration_service.entity.Registration;
import com.example.registration_service.repository.RegistrationRepository;
import com.example.registration_service.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private static final String DA_DANG_KY = "DA_DANG_KY";
    private static final String DA_HUY = "DA_HUY";

    private final RegistrationRepository registrationRepository;
    private final CourseClient courseClient;

    // =========================
    // ĐĂNG KÝ HỌC PHẦN
    // =========================
    @Override
    public Registration register(RegistrationRequestDTO dto) {

        // Kiểm tra đã đăng ký môn này chưa
        if (
                registrationRepository
                        .existsByStudentIdAndCourseIdAndTrangThai(
                                dto.getStudentId(),
                                dto.getCourseId(),
                                DA_DANG_KY
                        )
        ) {
            throw new IllegalStateException(
                    "Sinh vien da dang ky mon hoc nay roi"
            );
        }

        // Gọi course-service để giảm số chỗ còn lại
        courseClient.reserveSeat(dto.getCourseId());

        Registration registration = new Registration();

        registration.setStudentId(dto.getStudentId());
        registration.setCourseId(dto.getCourseId());
        registration.setTrangThai(DA_DANG_KY);
        registration.setNgayDangKy(LocalDateTime.now());

        return registrationRepository.save(registration);
    }

    // =========================
    // HỦY ĐĂNG KÝ
    // =========================
    @Override
    public void cancel(Long registrationId) {

        Registration registration =
                registrationRepository
                        .findById(registrationId)
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay dang ky id = "
                                                + registrationId
                                )
                        );

        if (DA_HUY.equals(registration.getTrangThai())) {
            throw new IllegalStateException(
                    "Dang ky nay da duoc huy truoc do"
            );
        }

        // Trả lại 1 chỗ cho course-service
        courseClient.releaseSeat(
                registration.getCourseId()
        );

        registration.setTrangThai(DA_HUY);

        registrationRepository.save(registration);
    }

    // =========================
    // BUỔI 9:
    // LẤY DANH SÁCH ĐĂNG KÝ
    // CỦA SINH VIÊN ĐANG ĐĂNG NHẬP
    // =========================
    @Override
    public List<Registration> getMyRegistrations(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }
}