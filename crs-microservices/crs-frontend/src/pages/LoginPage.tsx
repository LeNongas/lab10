import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) return <Navigate to="/courses" replace />;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { data } = await loginRequest(username.trim(), password);
            login(data);
            navigate(data.role === 'ADMIN' ? '/admin/courses' : '/courses', { replace: true });
        } catch (requestError) {
            let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
            if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
                message = 'Sai tên đăng nhập hoặc mật khẩu.';
            }
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="card login-card">
            <h1>Đăng nhập</h1>
            <form className="stack" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
                </div>
                <div className="field">
                    <label htmlFor="password">Mật khẩu</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                </div>
                {error && <div className="message error" role="alert">{error}</div>}
                <button type="submit" disabled={submitting}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
            </form>
        </section>
    );
}
