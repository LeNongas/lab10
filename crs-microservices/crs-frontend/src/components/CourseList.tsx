import type { Course } from '../types/course';
import type { LoadState } from '../api/useCourses';
import { useAuth } from '../hooks/useAuth';

interface CourseListProps {
    courses: Course[];
    state: LoadState;
    errorMessage: string;
    onRetry: () => void;

    onEdit?: (course: Course) => void;
    onDelete?: (course: Course) => void;
    onRegister?: (course: Course) => void;
    registeringCourseId?: number | null;
}

export default function CourseList({
                                       courses,
                                       state,
                                       errorMessage,
                                       onRetry,
                                       onEdit,
                                       onDelete,
                                       onRegister,
                                       registeringCourseId,
                                   }: CourseListProps) {
    const { user } = useAuth();
    const showAdminActions = user?.role === 'ADMIN' && onEdit && onDelete;
    const showStudentActions = user?.role === 'STUDENT' && onRegister;
    const showActions = Boolean(showAdminActions || showStudentActions);

    // Đang tải
    if (state === 'loading') {
        return (
            <p>Đang tải danh sách môn học...</p>
        );
    }

    // Có lỗi
    if (state === 'error') {
        return (
            <div style={{ color: '#b91c1c' }}>
                <p>{errorMessage}</p>

                <button onClick={onRetry}>
                    Thử lại
                </button>
            </div>
        );
    }

    // Danh sách rỗng
    if (state === 'empty') {
        return (
            <p>Không tìm thấy môn học nào phù hợp.</p>
        );
    }

    return (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
            }}
        >
            <thead>
            <tr
                style={{
                    textAlign: 'left',
                    borderBottom: '2px solid #333',
                }}
            >
                <th style={{ padding: '10px' }}>
                    Tên môn học
                </th>

                <th style={{ padding: '10px' }}>
                    Số tín chỉ
                </th>

                <th style={{ padding: '10px' }}>
                    Số chỗ còn lại
                </th>

                {showActions && <th style={{ padding: '10px' }}>Thao tác</th>}
            </tr>
            </thead>

            <tbody>
            {courses.map((course) => (
                <tr
                    key={course.id}
                    style={{
                        borderBottom: '1px solid #eee',
                    }}
                >
                    {/* Tên môn học */}
                    <td style={{ padding: '10px' }}>
                        {course.tenMonHoc}
                    </td>

                    {/* Số tín chỉ */}
                    <td style={{ padding: '10px' }}>
                        {course.soTinChi ?? '-'}
                    </td>

                    {/* Số chỗ */}
                    <td
                        style={{
                            padding: '10px',
                            color:
                                course.soChoConLai === 0
                                    ? '#b91c1c'
                                    : 'inherit',
                        }}
                    >
                        {course.soChoConLai}
                        {' / '}
                        {course.soChoToiDa}
                    </td>

                    {showActions && (
                        <td style={{ padding: '10px' }}>
                            {showAdminActions && (
                                <>
                                    <button type="button" onClick={() => onEdit(course)}>Sửa</button>{' '}
                                    <button type="button" className="danger" onClick={() => onDelete(course)}>Xóa</button>
                                </>
                            )}
                            {showStudentActions && (
                                <button
                                    type="button"
                                    onClick={() => onRegister(course)}
                                    disabled={course.soChoConLai === 0 || registeringCourseId === course.id}
                                >
                                    {registeringCourseId === course.id ? 'Đang đăng ký...' : 'Đăng ký'}
                                </button>
                            )}
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
