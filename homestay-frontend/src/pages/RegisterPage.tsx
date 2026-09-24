import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { registerRequest } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next');
    const destination = next?.startsWith('/book-room') ? next : '/rooms';

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'ADMIN' ? '/admin/rooms' : destination} replace />;
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const { data } = await registerRequest(username.trim(), password);
            login(data);
            navigate(destination, { replace: true });
        } catch (requestError) {
            const message = axios.isAxiosError(requestError)
                ? requestError.response?.data?.message
                : undefined;
            setError(typeof message === 'string' ? message : 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="card login-card">
            <h1>Tạo tài khoản khách</h1>
            <form className="stack" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="register-username">Tên đăng nhập</label>
                    <input id="register-username" type="text" value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username" minLength={3} maxLength={50} required />
                </div>
                <div className="field">
                    <label htmlFor="register-password">Mật khẩu</label>
                    <input id="register-password" type="password" value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password" minLength={8} required />
                </div>
                <div className="field">
                    <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
                    <input id="register-confirm-password" type="password" value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password" minLength={8} required />
                </div>
                {error && <div className="message error" role="alert">{error}</div>}
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </button>
            </form>
            <p style={{ textAlign: 'center' }}>
                Đã có tài khoản? <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}>Đăng nhập</Link>
            </p>
        </section>
    );
}
