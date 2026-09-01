import { useState } from 'react';
import { createCourse, deleteCourse, updateCourse } from '../api/courseApi';
import type { CourseFormValues } from '../api/courseApi';
import { useCourses } from '../api/useCourses';
import type { Course } from '../types/course';
import CourseForm from '../components/CourseForm';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';

export default function AdminCoursesPage() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page);

    const handleSave = async (values: CourseFormValues) => {
        try {
            setSubmitting(true);
            setServerError(null);
            if (editingCourse) await updateCourse(editingCourse.id, values);
            else await createCourse(values);
            setEditingCourse(null);
            await refetch();
        } catch {
            setServerError('Không thể lưu môn học. Vui lòng kiểm tra lại dữ liệu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (course: Course) => {
        if (!window.confirm(`Bạn có chắc muốn xóa môn học "${course.tenMonHoc}" không?`)) return;
        try {
            await deleteCourse(course.id);
            if (editingCourse?.id === course.id) setEditingCourse(null);
            await refetch();
        } catch {
            window.alert('Không thể xóa môn học. Vui lòng kiểm tra quyền ADMIN hoặc token.');
        }
    };

    return (
        <section>
            <h1>Quản lý môn học</h1>
            <CourseForm
                editingCourse={editingCourse}
                onSave={handleSave}
                onCancel={() => { setEditingCourse(null); setServerError(null); }}
                submitting={submitting}
                serverError={serverError}
            />
            <div className="toolbar">
                <SearchBox onSearch={(value) => { setKeyword(value); setPage(0); }} />
            </div>
            <CourseList
                courses={courses}
                state={state}
                errorMessage={errorMessage}
                onRetry={refetch}
                onEdit={(course) => {
                    setEditingCourse(course);
                    setServerError(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDelete}
            />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
    );
}
