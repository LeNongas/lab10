import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { createUser, deleteUser, getUsers, updateUser } from '../api/userApi';
import type { ManagedUser, UserValues } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';

const blank: UserValues = { username: '', password: '', role: 'CUSTOMER' };

function errorText(error: unknown) {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message as string;
    }
    return 'Không thể lưu tài khoản. Vui lòng thử lại.';
}

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [values, setValues] = useState<UserValues>(blank);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadUsers = useCallback(async () => {
        try {
            setUsers((await getUsers()).data);
            setError('');
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void loadUsers(); }, [loadUsers]);

    const reset = () => { setValues(blank); setEditingId(null); setError(''); };
    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (values.username.trim().length < 3 || (!editingId && values.password.length < 8)
            || (values.password.length > 0 && values.password.length < 8)) {
            setError('Tên đăng nhập cần ít nhất 3 ký tự, mật khẩu mới cần ít nhất 8 ký tự.');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...values, username: values.username.trim() };
            if (editingId) await updateUser(editingId, payload);
            else await createUser(payload);
            reset();
            await loadUsers();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (account: ManagedUser) => {
        if (!window.confirm(`Xóa tài khoản “${account.username}”?`)) return;
        try {
            await deleteUser(account.id);
            if (editingId === account.id) reset();
            await loadUsers();
        } catch (requestError) {
            setError(errorText(requestError));
        }
    };

    return <section>
        <span className="eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</span>
        <h1>Quản lý tài khoản</h1>
        <form className="card stack admin-user-form" onSubmit={(event) => void save(event)}>
            <h2>{editingId ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</h2>
            <label className="field">Tên đăng nhập
                <input value={values.username} minLength={3} maxLength={50} required
                    onChange={(event) => setValues({ ...values, username: event.target.value })} />
            </label>
            <label className="field">Mật khẩu {editingId && '(để trống nếu giữ nguyên)'}
                <input type="password" minLength={8} required={!editingId} value={values.password}
                    onChange={(event) => setValues({ ...values, password: event.target.value })} />
            </label>
            <label className="field">Vai trò
                <select value={values.role} disabled={editingId === currentUser?.id}
                    onChange={(event) => setValues({ ...values, role: event.target.value as UserValues['role'] })}>
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="ADMIN">Quản trị viên</option>
                </select>
            </label>
            <div className="room-actions">
                <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
                {editingId && <button type="button" onClick={reset}>Hủy sửa</button>}
            </div>
        </form>
        {error && <p className="message error" role="alert">{error}</p>}
        {loading ? <p>Đang tải tài khoản...</p> : <div className="booking-list">
            {users.map((account) => <article className="card admin-user-row" key={account.id}>
                <div><strong>{account.username}</strong><p>{account.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}</p></div>
                <div className="room-actions">
                    <button type="button" onClick={() => { setEditingId(account.id); setValues({ username: account.username, password: '', role: account.role }); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Sửa</button>
                    <button type="button" className="danger" disabled={account.id === currentUser?.id} onClick={() => void remove(account)}>Xóa</button>
                </div>
            </article>)}
        </div>}
    </section>;
}
