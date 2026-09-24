import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCalendarPage from './pages/AdminCalendarPage';
import ApiKeysPage from './pages/ApiKeysPage';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookRoomPage from './pages/BookRoomPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPaymentSettingsPage from './pages/AdminPaymentSettingsPage';

import MyBookingsPage from './pages/MyBookingsPage';

function AppLayout() {
    const location = useLocation();
    return <>
                <Navbar />

                <main className={location.pathname === '/rooms' ? 'page-shell page-shell-home' : location.pathname === '/login' ? 'page-shell page-shell-auth' : 'page-shell'}>
                    <Routes>

                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/rooms"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="/login"
                            element={<LoginPage />}
                        />

                        <Route
                            path="/register"
                            element={<RegisterPage />}
                        />

                        <Route
                            path="/rooms"
                            element={<RoomPage />}
                        />

                        <Route
                            path="/admin/rooms"
                            element={
                                <ProtectedRoute
                                    requiredRole="ADMIN"
                                >
                                    <AdminRoomsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/bookings"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <AdminBookingsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsersPage /></ProtectedRoute>} />
                        <Route path="/admin/calendar" element={<ProtectedRoute requiredRole="ADMIN"><AdminCalendarPage /></ProtectedRoute>} />
                        <Route path="/admin/payment-settings" element={<ProtectedRoute requiredRole="ADMIN"><AdminPaymentSettingsPage /></ProtectedRoute>} />

                        <Route
                            path="/admin/api-keys"
                            element={
                                <ProtectedRoute
                                    requiredRole="ADMIN"
                                >
                                    <ApiKeysPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/book-room"
                            element={
                                <ProtectedRoute
                                    requiredRole="CUSTOMER"
                                >
                                    <BookRoomPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/notifications" element={<ProtectedRoute requiredRole="CUSTOMER"><NotificationsPage /></ProtectedRoute>} />

                        <Route
                            path="/my-bookings"
                            element={
                                <ProtectedRoute
                                    requiredRole="CUSTOMER"
                                >
                                    <MyBookingsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/rooms"
                                    replace
                                />
                            }
                        />

                    </Routes>
                </main>

    </>;
}

export default function App() {
    return <BrowserRouter><AuthProvider><AppLayout /></AuthProvider></BrowserRouter>;
}
