import type { Course } from '../types/course';
import type { LoadState } from '../api/useCourses';

interface CourseListProps {
    courses: Course[];
    state: LoadState;
    errorMessage: string;
    onRetry: () => void;

    // Thêm 2 hàm để xử lý Sửa / Xóa
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export default function CourseList({
                                       courses,
                                       state,
                                       errorMessage,
                                       onRetry,
                                       onEdit,
                                       onDelete,
                                   }: CourseListProps) {

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

                {/* Cột mới */}
                <th style={{ padding: '10px' }}>
                    Thao tác
                </th>
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

                    {/* Nút Sửa / Xóa */}
                    <td style={{ padding: '10px' }}>
                        <button
                            type="button"
                            onClick={() => onEdit(course)}
                            style={{
                                marginRight: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            Sửa
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(course)}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            Xóa
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}