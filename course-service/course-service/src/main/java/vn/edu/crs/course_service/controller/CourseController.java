package vn.edu.crs.course_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import vn.edu.crs.course_service.dto.CourseDTO;
import vn.edu.crs.course_service.service.CourseService;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // =========================
    // API CÔNG KHAI
    // GET /api/public/courses
    // =========================
    @GetMapping("/public/courses")
    public Page<CourseDTO> getPublicCourses(
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return courseService.search(keyword, pageable);
    }

    // =========================
    // LẤY DANH SÁCH
    // GET /api/courses
    // =========================
    @GetMapping("/courses")
    public Page<CourseDTO> search(
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return courseService.search(keyword, pageable);
    }

    // =========================
    // BUỔI 9:
    // LẤY 1 MÔN HỌC THEO ID
    // GET /api/courses/{id}
    // =========================
    @GetMapping("/courses/{id}")
    public CourseDTO getById(
            @PathVariable Long id
    ) {
        return courseService.getById(id);
    }

    // =========================
    // THÊM MÔN HỌC
    // POST /api/courses
    // =========================
    @PostMapping("/courses")
    public CourseDTO create(
            @RequestBody CourseDTO courseDTO
    ) {
        return courseService.create(courseDTO);
    }

    // =========================
    // SỬA MÔN HỌC
    // PUT /api/courses/{id}
    // =========================
    @PutMapping("/courses/{id}")
    public CourseDTO update(
            @PathVariable Long id,
            @RequestBody CourseDTO courseDTO
    ) {
        return courseService.update(id, courseDTO);
    }

    // =========================
    // XÓA MÔN HỌC
    // DELETE /api/courses/{id}
    // =========================
    @DeleteMapping("/courses/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        courseService.delete(id);
    }
}