package vn.edu.crs.course_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.edu.crs.course_service.dto.CourseDTO;
import vn.edu.crs.course_service.entity.Course;
import vn.edu.crs.course_service.repository.CourseRepository;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    // ==========================================
    // 1. TÌM KIẾM + PHÂN TRANG
    // ==========================================
    public Page<CourseDTO> search(String keyword, Pageable pageable) {

        Page<Course> page =
                (keyword == null || keyword.isBlank())
                        ? courseRepository.findAll(pageable)
                        : courseRepository
                        .findByTenMonHocContainingIgnoreCase(
                                keyword,
                                pageable
                        );

        return page.map(this::toDTO);
    }


    // ==========================================
    // 2. THÊM MÔN HỌC
    // ==========================================
    @Transactional
    public CourseDTO create(CourseDTO courseDTO) {

        Course course = new Course();

        course.setTenMonHoc(
                courseDTO.getTenMonHoc()
        );

        course.setSoTinChi(
                courseDTO.getSoTinChi()
        );

        course.setSoChoToiDa(
                courseDTO.getSoChoToiDa()
        );

        // Khi tạo mới:
        // số chỗ còn lại = số chỗ tối đa
        course.setSoChoConLai(
                courseDTO.getSoChoToiDa()
        );

        Course savedCourse =
                courseRepository.save(course);

        return toDTO(savedCourse);
    }


    // ==========================================
    // 3. CẬP NHẬT MÔN HỌC
    // ==========================================
    @Transactional
    public CourseDTO update(
            Long id,
            CourseDTO courseDTO
    ) {

        Course course =
                courseRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay mon hoc id = " + id
                                        )
                        );

        course.setTenMonHoc(
                courseDTO.getTenMonHoc()
        );

        course.setSoTinChi(
                courseDTO.getSoTinChi()
        );

        /*
         * Tính số sinh viên đã đăng ký.
         *
         * Ví dụ:
         * tối đa = 40
         * còn lại = 35
         *
         * => đã đăng ký = 5
         */
        int soLuongDaDangKy =
                course.getSoChoToiDa()
                        - course.getSoChoConLai();

        int soChoToiDaMoi =
                courseDTO.getSoChoToiDa();

        // Không được giảm số chỗ nhỏ hơn
        // số sinh viên đã đăng ký
        if (soChoToiDaMoi < soLuongDaDangKy) {

            throw new IllegalArgumentException(
                    "So cho toi da moi khong du cho sinh vien da dang ky"
            );
        }

        course.setSoChoToiDa(
                soChoToiDaMoi
        );

        course.setSoChoConLai(
                soChoToiDaMoi
                        - soLuongDaDangKy
        );

        Course updatedCourse =
                courseRepository.save(course);

        return toDTO(updatedCourse);
    }


    // ==========================================
    // 4. XÓA MÔN HỌC
    // ==========================================
    @Transactional
    public void delete(Long id) {

        Course course =
                courseRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay mon hoc id = " + id
                                        )
                        );

        courseRepository.delete(course);
    }


    // ==========================================
    // 5. GIỮ CHỖ
    // Internal API
    // ==========================================
    @Transactional
    public CourseDTO reserveSeat(Long courseId) {

        Course course =
                courseRepository
                        .findById(courseId)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay mon hoc id = " + courseId
                                        )
                        );

        if (course.getSoChoConLai() <= 0) {

            throw new IllegalStateException(
                    "Mon hoc da het cho, khong the dang ky"
            );
        }

        course.setSoChoConLai(
                course.getSoChoConLai() - 1
        );

        return toDTO(
                courseRepository.save(course)
        );
    }


    // ==========================================
    // 6. TRẢ CHỖ
    // Internal API
    // ==========================================
    @Transactional
    public CourseDTO releaseSeat(Long courseId) {

        Course course =
                courseRepository
                        .findById(courseId)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay mon hoc id = " + courseId
                                        )
                        );

        if (
                course.getSoChoConLai()
                        < course.getSoChoToiDa()
        ) {

            course.setSoChoConLai(
                    course.getSoChoConLai() + 1
            );
        }

        return toDTO(
                courseRepository.save(course)
        );
    }


    // ==========================================
    // 7. ENTITY -> DTO
    // ==========================================
    private CourseDTO toDTO(Course course) {

        CourseDTO dto = new CourseDTO();

        dto.setId(
                course.getId()
        );

        dto.setTenMonHoc(
                course.getTenMonHoc()
        );

        dto.setSoTinChi(
                course.getSoTinChi()
        );

        dto.setSoChoToiDa(
                course.getSoChoToiDa()
        );

        dto.setSoChoConLai(
                course.getSoChoConLai()
        );

        return dto;
    }
}