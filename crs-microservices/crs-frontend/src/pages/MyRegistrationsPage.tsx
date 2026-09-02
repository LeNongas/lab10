import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import axios from 'axios';

import {
    cancelRegistration,
    getMyRegistrations,
} from '../api/registrationApi';

import { getCourseById } from '../api/courseApi';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

import type { Registration } from '../types/registration';

interface ApiErrorResponse {
    message?: string;
}

interface RegistrationRow extends Registration {
    courseName: string;
}

export default function MyRegistrationsPage() {

    const [rows, setRows] =
        useState<RegistrationRow[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [loadError, setLoadError] =
        useState<string | null>(null);

    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    const {
        toast,
        showToast,
        clearToast,
    } = useToast();

    // ============================
    // TẢI DANH SÁCH ĐĂNG KÝ
    // ============================
    const loadData = useCallback(async () => {

        setLoading(true);
        setLoadError(null);

        try {

            // Lấy đăng ký của sinh viên hiện tại
            const res =
                await getMyRegistrations();

            // Chỉ lấy những đăng ký đang hoạt động
            const activeRegistrations =
                res.data.filter(
                    (registration) =>
                        registration.trangThai ===
                        'DA_DANG_KY'
                );

            // Ghép courseId với tên môn học
            const enriched =
                await Promise.all(
                    activeRegistrations.map(
                        async (registration) => {

                            try {

                                const courseRes =
                                    await getCourseById(
                                        registration.courseId
                                    );

                                return {
                                    ...registration,
                                    courseName:
                                    courseRes.data.tenMonHoc,
                                };

                            } catch {

                                // Nếu môn đã bị xóa hoặc
                                // không lấy được thông tin
                                return {
                                    ...registration,
                                    courseName:
                                        `Môn học #${registration.courseId} ` +
                                        '(không tìm thấy thông tin)',
                                };
                            }
                        }
                    )
                );

            setRows(enriched);

        } catch (err) {

            let message =
                'Không tải được danh sách đăng ký.';

            if (
                axios.isAxiosError<ApiErrorResponse>(err) &&
                err.response?.data?.message
            ) {
                message =
                    err.response.data.message;
            }

            setLoadError(message);

        } finally {

            setLoading(false);
        }

    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================
    // HỦY ĐĂNG KÝ
    // ============================
    const handleCancel = async (
        row: RegistrationRow
    ) => {

        const confirmed =
            window.confirm(
                `Hủy đăng ký môn "${row.courseName}"?`
            );

        if (!confirmed) {
            return;
        }

        setCancellingId(row.id);

        try {

            await cancelRegistration(row.id);

            showToast(
                `Đã hủy đăng ký môn "${row.courseName}"`,
                'success'
            );

            // Load lại danh sách sau khi hủy
            await loadData();

        } catch (err) {

            let message =
                'Hủy đăng ký không thành công.';

            if (
                axios.isAxiosError<ApiErrorResponse>(err) &&
                err.response?.data?.message
            ) {
                message =
                    err.response.data.message;
            }

            showToast(
                message,
                'error'
            );

        } finally {

            setCancellingId(null);
        }
    };

    return (
        <div
            style={{
                padding: 24,
                maxWidth: 800,
                margin: '0 auto',
            }}
        >
            <h1>
                Môn học đã đăng ký
            </h1>

            {loading && (
                <p>Đang tải...</p>
            )}

            {!loading && loadError && (
                <p
                    style={{
                        color: '#b91c1c',
                    }}
                >
                    {loadError}
                </p>
            )}

            {!loading &&
                !loadError &&
                rows.length === 0 && (
                    <p>
                        Bạn chưa đăng ký môn học nào.
                    </p>
                )}

            {!loading &&
                !loadError &&
                rows.length > 0 && (

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
                                borderBottom:
                                    '2px solid #333',
                            }}
                        >
                            <th
                                style={{
                                    padding: '10px',
                                }}
                            >
                                Tên môn học
                            </th>

                            <th
                                style={{
                                    padding: '10px',
                                }}
                            >
                                Ngày đăng ký
                            </th>

                            <th
                                style={{
                                    padding: '10px',
                                }}
                            >
                                Thao tác
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                style={{
                                    borderBottom:
                                        '1px solid #eee',
                                }}
                            >
                                <td
                                    style={{
                                        padding: '10px',
                                    }}
                                >
                                    {row.courseName}
                                </td>

                                <td
                                    style={{
                                        padding: '10px',
                                    }}
                                >
                                    {new Date(
                                        row.ngayDangKy
                                    ).toLocaleString(
                                        'vi-VN'
                                    )}
                                </td>

                                <td
                                    style={{
                                        padding: '10px',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCancel(row)
                                        }
                                        disabled={
                                            cancellingId ===
                                            row.id
                                        }
                                    >
                                        {cancellingId ===
                                        row.id
                                            ? 'Đang hủy...'
                                            : 'Hủy đăng ký'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={clearToast}
                />
            )}
        </div>
    );
}