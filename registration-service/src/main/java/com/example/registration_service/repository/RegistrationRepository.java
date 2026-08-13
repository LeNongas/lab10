package com.example.registration_service.repository;

import com.example.registration_service.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRepository extends
        JpaRepository<Registration, Long> {
    List<Registration> findByStudentId(Long studentId);
    boolean existsByStudentIdAndCourseIdAndTrangThai(Long studentId, Long courseId,String trangThai);
}
