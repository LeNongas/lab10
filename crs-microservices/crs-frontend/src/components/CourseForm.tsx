import { useEffect, useState } from 'react';
import type { Course } from '../types/course';
import type { CourseFormValues } from '../api/courseApi';

interface CourseFormProps {
    editingCourse: Course | null;
    onSave: (values: CourseFormValues) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    serverError: string | null;
}

export default function CourseForm({
                                       editingCourse,
                                       onSave,
                                       onCancel,
                                       submitting,
                                       serverError,
                                   }: CourseFormProps) {

    const [values, setValues] = useState<CourseFormValues>({
        tenMonHoc: '',
        soTinChi: 3,
        soChoToiDa: 40,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Khi bấm Sửa thì đổ dữ liệu môn học vào form
    useEffect(() => {
        if (editingCourse) {
            setValues({
                tenMonHoc: editingCourse.tenMonHoc,
                soTinChi: editingCourse.soTinChi ?? 3,
                soChoToiDa: editingCourse.soChoToiDa ?? 40,
            });
        } else {
            setValues({
                tenMonHoc: '',
                soTinChi: 3,
                soChoToiDa: 40,
            });
        }

        setErrors({});
    }, [editingCourse]);

    // Validate dữ liệu
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.tenMonHoc.trim()) {
            newErrors.tenMonHoc = 'Tên môn học không được để trống';
        }

        if (!values.soTinChi || values.soTinChi <= 0) {
            newErrors.soTinChi = 'Số tín chỉ phải lớn hơn 0';
        }

        if (!values.soChoToiDa || values.soChoToiDa <= 0) {
            newErrors.soChoToiDa = 'Số chỗ tối đa phải lớn hơn 0';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        await onSave(values);
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                border: '1px solid #ddd',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
            }}
        >
            <h3>
                {editingCourse ? 'Cập nhật môn học' : 'Thêm môn học'}
            </h3>

            {/* Tên môn học */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Tên môn học:
                </label>

                <br />

                <input
                    type="text"
                    value={values.tenMonHoc}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            tenMonHoc: e.target.value,
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.tenMonHoc && (
                    <div style={{ color: 'red' }}>
                        {errors.tenMonHoc}
                    </div>
                )}
            </div>

            {/* Số tín chỉ */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Số tín chỉ:
                </label>

                <br />

                <input
                    type="number"
                    value={values.soTinChi}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            soTinChi: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.soTinChi && (
                    <div style={{ color: 'red' }}>
                        {errors.soTinChi}
                    </div>
                )}
            </div>

            {/* Số chỗ tối đa */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Số chỗ tối đa:
                </label>

                <br />

                <input
                    type="number"
                    value={values.soChoToiDa}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            soChoToiDa: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.soChoToiDa && (
                    <div style={{ color: 'red' }}>
                        {errors.soChoToiDa}
                    </div>
                )}
            </div>

            {/* Lỗi từ server */}
            {serverError && (
                <div
                    style={{
                        color: 'red',
                        marginBottom: '15px',
                    }}
                >
                    {serverError}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
            >
                {submitting
                    ? 'Đang lưu...'
                    : editingCourse
                        ? 'Cập nhật'
                        : 'Thêm mới'}
            </button>

            {editingCourse && (
                <button
                    type="button"
                    onClick={onCancel}
                    style={{ marginLeft: '10px' }}
                >
                    Hủy
                </button>
            )}
        </form>
    );
}