import { useEffect, useState } from 'react';
import type { Room } from '../types/room';
import type { RoomFormValues } from '../api/roomApi';
import type { RoomCategory } from '../api/categoryApi';

interface RoomFormProps {
    editingRoom: Room | null;
    onSave: (values: RoomFormValues, image: File | null) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    serverError: string | null;
    categories: RoomCategory[];
}

export default function RoomForm({
                                       editingRoom,
                                       onSave,
                                       onCancel,
                                       submitting,
                                       serverError,
                                       categories,
                                   }: RoomFormProps) {

    const [values, setValues] = useState<RoomFormValues>({
        name: '',
        maxGuests: 3,
        quantity: 2,
        pricePerNight: 650000,
        description: '',
        categoryId: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [image, setImage] = useState<File | null>(null);

    // Khi bấm Sửa thì đổ dữ liệu phòng vào form
    useEffect(() => {
        if (editingRoom) {
            setValues({
                name: editingRoom.name,
                maxGuests: editingRoom.maxGuests ?? 3,
                quantity: editingRoom.quantity ?? 2,
                pricePerNight: editingRoom.pricePerNight ?? 650000,
                description: editingRoom.description ?? '',
                categoryId: editingRoom.categoryId ?? 0,
            });
        } else {
            setValues({
                name: '',
                maxGuests: 3,
                quantity: 2,
                pricePerNight: 650000,
                description: '',
                categoryId: 0,
            });
        }

        setErrors({});
        setImage(null);
    }, [editingRoom]);

    // Validate dữ liệu
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.name.trim()) {
            newErrors.name = 'Tên phòng không được để trống';
        }

        if (!values.maxGuests || values.maxGuests <= 0) {
            newErrors.maxGuests = 'Số khách tối đa mỗi phòng phải lớn hơn 0';
        }

        if (!values.quantity || values.quantity <= 0) {
            newErrors.quantity = 'Số phòng cho thuê phải lớn hơn 0';
        }
        if (!values.pricePerNight || values.pricePerNight <= 0) {
            newErrors.pricePerNight = 'Giá phòng phải lớn hơn 0';
        }
        if (!values.categoryId) {
            newErrors.categoryId = 'Vui lòng chọn loại phòng';
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

        await onSave(values, image);
    };

    return (
        <form
            className="admin-room-form card"
            onSubmit={handleSubmit}
        >
            <h3>
                {editingRoom ? 'Cập nhật phòng' : 'Thêm phòng'}
            </h3>

            {/* Tên phòng */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Tên phòng:
                </label>

                <br />

                <input
                    type="text"
                    value={values.name}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            name: e.target.value,
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.name && (
                    <div style={{ color: 'red' }}>
                        {errors.name}
                    </div>
                )}
            </div>

            {/* Số khách tối đa */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Số khách tối đa mỗi phòng:
                </label>

                <br />

                <input
                    type="number"
                    value={values.maxGuests}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            maxGuests: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.maxGuests && (
                    <div style={{ color: 'red' }}>
                        {errors.maxGuests}
                    </div>
                )}
            </div>

            {/* Số chỗ tối đa */}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Số phòng cho thuê:
                </label>

                <br />

                <input
                    type="number"
                    value={values.quantity}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            quantity: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '5px',
                    }}
                />

                {errors.quantity && (
                    <div style={{ color: 'red' }}>
                        {errors.quantity}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Giá mỗi đêm (đồng):</label><br />
                <input type="number" min="1" value={values.pricePerNight}
                    onChange={(e) => setValues({ ...values, pricePerNight: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                {errors.pricePerNight && <div style={{ color: 'red' }}>{errors.pricePerNight}</div>}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Mô tả:</label><br />
                <textarea value={values.description}
                    onChange={(e) => setValues({ ...values, description: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Loại phòng:</label><br />
                <select value={values.categoryId}
                    onChange={(e) => setValues({ ...values, categoryId: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                    <option value={0}>Chọn loại phòng</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {errors.categoryId && <div style={{ color: 'red' }}>{errors.categoryId}</div>}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Ảnh phòng:</label><br />
                <input type="file" accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
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
                    : editingRoom
                        ? 'Cập nhật'
                        : 'Thêm mới'}
            </button>

            {editingRoom && (
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
