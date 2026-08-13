package com.example.courseservice.service;

import com.example.courseservice.dto.CourseDTO;
import com.example.courseservice.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {
    List<CourseDTO> getAll();

    Page<CourseDTO> search(String keyword, Pageable pageable);

    CourseDTO getById(Long id);

    CourseDTO create(CourseDTO dto);

    CourseDTO update(Long id, CourseDTO dto);

    void delete(Long id);

    CourseDTO reserveSeat(Long courseId);

    CourseDTO releaseSeat(Long courseId);


}
