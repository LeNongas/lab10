import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUnreadCount } from '../api/notificationApi';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user?.role !== 'CUSTOMER') return;
        const refresh = () => { void getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {}); };
        refresh();
        const timer = window.setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);
        window.addEventListener('homestay-notifications-updated', refresh);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', refresh);
            window.removeEventListener('homestay-notifications-updated', refresh);
        };
    }, [user?.role, user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return <header className="site-header">
        <div className="topbar">
            <div className="header-container topbar-inner">
                <span>✦ &nbsp; NEST HOMESTAY & RETREATS</span>
                <div className="topbar-links">
                    {isAuthenticated ? <>
                        <span>Xin chào, {user?.username}</span>
                        <button type="button" onClick={handleLogout}>Đăng xuất</button>
                    </> : <>
                        <NavLink to="/register">Tham gia miễn phí</NavLink>
                        <NavLink to="/login">Đăng nhập</NavLink>
                    </>}
                </div>
            </div>
        </div>
        <div className="main-nav">
            <div className="nav-brand-row">
                <NavLink className="brand" to="/rooms" aria-label="Trang chủ NEST Homestay">
                    <strong>NEST<span>.</span></strong>
                    <small>HOMESTAY & RETREATS</small>
                </NavLink>
            </div>
            <div className="header-container nav-inner">
                <nav className="primary-links" aria-label="Điều hướng chính">
                    <NavLink to="/rooms">PHÒNG & KHÔNG GIAN</NavLink>
                    {user?.role === 'CUSTOMER' && <>
                        <NavLink to="/book-room">TÌM KỲ NGHỈ</NavLink>
                        <NavLink to="/my-bookings">ĐẶT CHỖ CỦA TÔI</NavLink>
                        <NavLink to="/notifications">THÔNG BÁO{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}</NavLink>
                    </>}
                    {user?.role === 'ADMIN' && <>
                        <NavLink to="/admin/rooms">Quản lý phòng</NavLink>
                        <NavLink to="/admin/calendar">Lịch phòng</NavLink>
                        <NavLink to="/admin/bookings">Đơn đặt phòng</NavLink>
                        <NavLink to="/admin/payment-settings">Nhận cọc</NavLink>
                        <NavLink to="/admin/users">Tài khoản</NavLink>
                        <NavLink to="/admin/api-keys">API Key</NavLink>
                    </>}
                </nav>
                <NavLink className="nav-book-link" to={user?.role === 'ADMIN' ? '/admin/bookings' : user?.role === 'CUSTOMER' ? '/book-room' : '/login'}>
                    {user?.role === 'ADMIN' ? 'XEM ĐƠN ĐẶT' : 'ĐẶT PHÒNG'} <span aria-hidden="true">↗</span>
                </NavLink>
            </div>
        </div>
    </header>;
}
