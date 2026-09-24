import { useCallback, useEffect, useState } from 'react';
import { createRoom, deleteRoom, updateRoom, uploadRoomImage } from '../api/roomApi';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/categoryApi';
import type { RoomCategory } from '../api/categoryApi';
import type { RoomFormValues } from '../api/roomApi';
import { useRooms } from '../api/useRooms';
import type { Room } from '../types/room';
import RoomForm from '../components/RoomForm';
import RoomList from '../components/RoomList';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';

export default function AdminRoomsPage() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formVersion, setFormVersion] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [categoryError, setCategoryError] = useState('');
    const loadCategories = useCallback(() => getCategories().then((response) => setCategories(response.data)), []);
    useEffect(() => { void loadCategories().catch(() => setCategoryError('Không tải được loại phòng.')); }, [loadCategories]);
    const { rooms, totalPages, state, errorMessage, refetch } = useRooms(keyword, page);

    const handleSave = async (values: RoomFormValues, image: File | null) => {
        try {
            setSubmitting(true);
            setServerError(null);
            const response = editingRoom
                ? await updateRoom(editingRoom.id, values)
                : await createRoom(values);
            if (image) {
                try {
                    await uploadRoomImage(response.data.id, image);
                } catch {
                    setEditingRoom(null);
                    setFormVersion((version) => version + 1);
                    await refetch();
                    setServerError('Phòng đã lưu, nhưng ảnh tải lên không thành công. Hãy sửa phòng để tải ảnh lại.');
                    return;
                }
            }
            setEditingRoom(null);
            setFormVersion((version) => version + 1);
            await refetch();
        } catch {
            setServerError('Không thể lưu phòng. Vui lòng kiểm tra lại dữ liệu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCategoryCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setCategoryError('');
            if (editingCategoryId) await updateCategory(editingCategoryId, categoryName.trim());
            else await createCategory(categoryName.trim());
            setCategoryName('');
            setEditingCategoryId(null);
            await loadCategories();
            await refetch();
        } catch {
            setCategoryError('Không thể lưu loại phòng. Kiểm tra tên bị trùng.');
        }
    };

    const handleCategoryDelete = async (category: RoomCategory) => {
        if (!window.confirm(`Xóa loại phòng "${category.name}"?`)) return;
        try {
            setCategoryError('');
            await deleteCategory(category.id);
            await loadCategories();
        } catch {
            setCategoryError('Không thể xóa loại phòng đang được sử dụng.');
        }
    };

    const handleDelete = async (room: Room) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phòng "${room.name}" không?`)) return;
        try {
            await deleteRoom(room.id);
            if (editingRoom?.id === room.id) setEditingRoom(null);
            await refetch();
        } catch {
            window.alert('Không thể xóa phòng. Vui lòng kiểm tra quyền quản trị.');
        }
    };

    return (
        <section>
            <span className="eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</span>
            <h1>Quản lý phòng</h1>
            <div className="card" style={{ marginBottom: 20 }}>
                <h2>Loại phòng</h2>
                <form onSubmit={handleCategoryCreate}>
                    <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)}
                        placeholder="Tên loại phòng" required />
                    <button type="submit">{editingCategoryId ? 'Lưu loại phòng' : 'Thêm loại phòng'}</button>
                    {editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryName(''); setCategoryError(''); }}>Hủy sửa</button>}
                </form>
                {categoryError && <p className="message error">{categoryError}</p>}
                <div style={{ marginTop: 12 }}>
                    {categories.map((category) => <span key={category.id} style={{ marginRight: 12 }}>
                        {category.name} <button type="button" onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name); setCategoryError(''); }}>Sửa</button>{' '}
                        <button type="button" onClick={() => handleCategoryDelete(category)}>Xóa</button>
                    </span>)}
                </div>
            </div>
            <RoomForm
                key={editingRoom ? `edit-${editingRoom.id}` : `new-${formVersion}`}
                editingRoom={editingRoom}
                onSave={handleSave}
                onCancel={() => { setEditingRoom(null); setServerError(null); }}
                submitting={submitting}
                serverError={serverError}
                categories={categories}
            />
            <div className="toolbar">
                <SearchBox onSearch={(value) => { setKeyword(value); setPage(0); }} />
            </div>
            <RoomList
                rooms={rooms}
                state={state}
                errorMessage={errorMessage}
                onRetry={refetch}
                onEdit={(room) => {
                    setEditingRoom(room);
                    setServerError(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDelete}
            />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
    );
}
