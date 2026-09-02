import type { Course } from '../types/course';
import type { LoadState } from '../api/useCourses';

interface CourseListProps {
    courses: Course[];
    state: LoadState;
    errorMessage: string;
    onRetry: () => void;

    onEdit?: (course: Course) => void;
    onDelete?: (course: Course) => void;

    // Buổi 9
    onRegister?: (course: Course) => void;
    registeringId?: number | null;
}

export default function CourseList({
                                       courses,
                                       state,
                                       errorMessage,
                                       onRetry,
                                       onEdit,
                                       onDelete,
                                       onRegister,
                                       registeringId,
                                   }: CourseListProps) {

    if (state === 'loading') {
        return <p>Đang tải danh sách môn học...</p>;
    }

    if (state === 'error') {
        return (
            <div style={{ color: '#b91c1c' }}>
                <p>{errorMessage}</p>

                <button
                    type="button"
                    onClick={onRetry}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (state === 'empty') {
        return <p>Không tìm thấy môn học nào phù hợp.</p>;
    }

    // Hiện cột thao tác nếu có ít nhất một hành động
    const showActions = Boolean(
        onEdit ||
        onDelete ||
        onRegister
    );

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

                {showActions && (
                    <th style={{ padding: '10px' }}>
                        Thao tác
                    </th>
                )}
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
                    <td style={{ padding: '10px' }}>
                        {course.tenMonHoc}
                    </td>

                    <td style={{ padding: '10px' }}>
                        {course.soTinChi ?? '-'}
                    </td>

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

                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={() => onEdit(course)}
                                >
                                    Sửa
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    type="button"
                                    className="danger"
                                    style={{
                                        marginLeft: onEdit
                                            ? '8px'
                                            : '0',
                                    }}
                                    onClick={() => onDelete(course)}
                                >
                                    Xóa
                                </button>
                            )}

                            {onRegister && (
                                <button
                                    type="button"
                                    style={{
                                        marginLeft:
                                            onEdit || onDelete
                                                ? '8px'
                                                : '0',
                                    }}
                                    onClick={() => onRegister(course)}
                                    disabled={
                                        course.soChoConLai === 0 ||
                                        registeringId === course.id
                                    }
                                >
                                    {registeringId === course.id
                                        ? 'Đang đăng ký...'
                                        : course.soChoConLai === 0
                                            ? 'Hết chỗ'
                                            : 'Đăng ký'}
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