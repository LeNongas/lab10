import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginRequest } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next');
    const customerDestination = next?.startsWith('/book-room') ? next : '/rooms';

    // Nếu đã đăng nhập thì không cho quay lại trang login
    if (isAuthenticated) {
        return <Navigate to={user?.role === 'ADMIN' ? '/admin/rooms' : customerDestination} replace />;
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError('');
        setSubmitting(true);

        try {
            // Gọi API đăng nhập
            const { data } = await loginRequest(
                username.trim(),
                password
            );

            // Lưu token + thông tin user vào AuthContext
            login(data);

            navigate(data.role === 'ADMIN' ? '/admin/rooms' : customerDestination, { replace: true });

        } catch (requestError) {
            let message = 'Đăng nhập thất bại. Vui lòng thử lại.';

            if (
                axios.isAxiosError(requestError) &&
                requestError.response?.status === 401
            ) {
                message = 'Sai tên đăng nhập hoặc mật khẩu.';
            }

            setError(message);

        } finally {
            setSubmitting(false);
        }
    };

    return <section className="auth-layout">
        <div className="auth-visual" aria-hidden="true">
            <div className="auth-visual-content">
                <span>NEST HOMESTAY & RETREATS</span>
                <h2>Một kỳ nghỉ đẹp<br /><span>bắt đầu từ đây.</span></h2>
                <p>Trở lại với những không gian bạn yêu thích.</p>
            </div>
            <span className="auth-visual-caption">NEST · Ở LẠI THEO CÁCH CỦA BẠN</span>
        </div>

        <div className="auth-form-panel">
            <div className="auth-form-inner">
                <span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span>
                <h1>Đăng nhập</h1>
                <p className="auth-lead">Tiếp tục hành trình của bạn cùng NEST.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input id="username" type="text" value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username" placeholder="Nhập tên đăng nhập" required />
                    </div>
                    <div className="field">
                        <label htmlFor="password">Mật khẩu</label>
                        <input id="password" type="password" value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password" placeholder="Nhập mật khẩu" required />
                    </div>

                    {error && <div className="message error" role="alert">{error}</div>}

                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'} <span aria-hidden="true">↗</span>
                    </button>
                </form>

                <p className="auth-signup">Chưa có tài khoản? <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}>Tạo tài khoản khách</Link></p>
            </div>
        </div>
    </section>;
}
