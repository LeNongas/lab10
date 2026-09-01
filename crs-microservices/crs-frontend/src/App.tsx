import { useState } from 'react';

import { useCourses } from './api/useCourses';
import {
    createCourse,
    updateCourse,
    deleteCourse,
} from './api/courseApi';

import type { CourseFormValues } from './api/courseApi';
import type { Course } from './types/course';

import SearchBox from './components/SearchBox';
import CourseList from './components/CourseList';
import Pagination from './components/Pagination';
import CourseForm from './components/CourseForm';

function App() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);

    // Môn học đang được sửa
    const [editingCourse, setEditingCourse] =
        useState<Course | null>(null);

    // Trạng thái đang gửi dữ liệu
    const [submitting, setSubmitting] = useState(false);

    // Lỗi khi thêm / sửa
    const [serverError, setServerError] =
        useState<string | null>(null);

    const {
        courses,
        totalPages,
        state,
        errorMessage,
        refetch,
    } = useCourses(keyword, page);

    // =========================
    // TÌM KIẾM
    // =========================
    const handleSearch = (newKeyword: string) => {
        setKeyword(newKeyword);

        // Tìm kiếm mới quay về trang đầu
        setPage(0);
    };

    // =========================
    // THÊM / CẬP NHẬT
    // =========================
    const handleSave = async (
        values: CourseFormValues
    ) => {
        try {
            setSubmitting(true);
            setServerError(null);

            // Nếu đang có môn học được chọn
            // thì thực hiện cập nhật
            if (editingCourse) {
                await updateCourse(
                    editingCourse.id,
                    values
                );

                alert('Cập nhật môn học thành công!');
            } else {
                // Không có editingCourse
                // thì thêm môn học mới
                await createCourse(values);

                alert('Thêm môn học thành công!');
            }

            // Thoát chế độ sửa
            setEditingCourse(null);

            // Load lại danh sách
            refetch();
        } catch (error) {
            console.error(error);

            setServerError(
                'Không thể lưu môn học. Vui lòng kiểm tra lại.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // SỬA
    // =========================
    const handleEdit = (course: Course) => {
        setEditingCourse(course);

        setServerError(null);

        // Cuộn lên form
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // =========================
    // HỦY SỬA
    // =========================
    const handleCancelEdit = () => {
        setEditingCourse(null);

        setServerError(null);
    };

    // =========================
    // XÓA
    // =========================
    const handleDelete = async (
        course: Course
    ) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa môn học "${course.tenMonHoc}" không?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteCourse(course.id);

            alert('Xóa môn học thành công!');

            // Nếu đang sửa đúng môn vừa xóa
            // thì đóng form sửa
            if (
                editingCourse &&
                editingCourse.id === course.id
            ) {
                setEditingCourse(null);
            }

            // Load lại danh sách
            refetch();
        } catch (error) {
            console.error(error);

            alert(
                'Không thể xóa môn học. Vui lòng kiểm tra quyền ADMIN hoặc token.'
            );
        }
    };

    return (
        <div
            style={{
                padding: 24,
                fontFamily: 'sans-serif',
                maxWidth: 900,
                margin: '0 auto',
            }}
        >
            <h1>Quản lý môn học</h1>

            {/* FORM THÊM / SỬA */}
            <CourseForm
                editingCourse={editingCourse}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                submitting={submitting}
                serverError={serverError}
            />

            {/* TÌM KIẾM */}
            <SearchBox
                onSearch={handleSearch}
            />

            {/* DANH SÁCH */}
            <div style={{ marginTop: 16 }}>
                <CourseList
                    courses={courses}
                    state={state}
                    errorMessage={errorMessage}
                    onRetry={refetch}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* PHÂN TRANG */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}

export default App;