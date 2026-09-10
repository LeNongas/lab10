import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">

                <NavLink
                    className="navbar-brand"
                    to="/courses"
                >
                    CRS
                </NavLink>

                <div className="navbar-links">

                    <NavLink to="/courses">
                        Môn học
                    </NavLink>

                    {user?.role === 'ADMIN' && (
                        <>
                            <NavLink to="/admin/courses">
                                Quản lý môn học
                            </NavLink>

                            <NavLink to="/admin/api-keys">
                                Quản lý API Key
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'STUDENT' && (
                        <>
                            <NavLink to="/register-course">
                                Đăng ký môn học
                            </NavLink>

                            <NavLink to="/my-registrations">
                                Môn học đã đăng ký
                            </NavLink>
                        </>
                    )}

                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                {user?.username} ({user?.role})
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login">
                            Đăng nhập
                        </NavLink>
                    )}

                </div>
            </div>
        </nav>
    );
}
