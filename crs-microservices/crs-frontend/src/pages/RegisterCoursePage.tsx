import { useState } from 'react';
import axios from 'axios';
import { registerCourse } from '../api/registrationApi';
import { useCourses } from '../api/useCourses';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';
import type { Course } from '../types/course';
import { useAuth } from '../hooks/useAuth';

export default function RegisterCoursePage() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [registeringCourseId, setRegisteringCourseId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { user } = useAuth();
    const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page);

    const handleRegister = async (course: Course) => {
        setRegisteringCourseId(course.id);
        setMessage(null);
        try {
            // Backend chưa trả studentId; tài khoản mẫu student1 tương ứng mã sinh viên 1.
            const studentId = Number(user?.username.match(/\d+$/)?.[0] ?? 1);
            await registerCourse({ studentId, courseId: course.id });
            setMessage({ type: 'success', text: `Đăng ký môn "${course.tenMonHoc}" thành công.` });
            await refetch();
        } catch (requestError) {
            const backendMessage = axios.isAxiosError(requestError)
                ? (requestError.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setMessage({ type: 'error', text: backendMessage ?? 'Không thể đăng ký môn học. Vui lòng thử lại.' });
        } finally {
            setRegisteringCourseId(null);
        }
    };

    return (
        <section>
            <h1>Đăng ký môn học</h1>
            <div className="toolbar">
                <SearchBox onSearch={(value) => { setKeyword(value); setPage(0); }} />
            </div>
            {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
            <CourseList
                courses={courses}
                state={state}
                errorMessage={errorMessage}
                onRetry={refetch}
                onRegister={handleRegister}
                registeringCourseId={registeringCourseId}
            />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
    );
}
