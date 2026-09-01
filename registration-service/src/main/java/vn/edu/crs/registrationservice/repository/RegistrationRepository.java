package vn.edu.crs.registrationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.crs.registrationservice.entity.Registration;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByStudentIdAndCourseIdAndTrangThai(Long studentId, Long courseId, String trangThai);
}