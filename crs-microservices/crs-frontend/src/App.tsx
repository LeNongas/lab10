import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCoursesPage from './pages/AdminCoursesPage';
import CoursePage from './pages/CoursePage';
import LoginPage from './pages/LoginPage';
import RegisterCoursePage from './pages/RegisterCoursePage';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <main className="page-shell">
                    <Routes>
                        <Route path="/" element={<Navigate to="/courses" replace />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/courses" element={<CoursePage />} />
                        <Route
                            path="/admin/courses"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <AdminCoursesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/register-course"
                            element={
                                <ProtectedRoute requiredRole="STUDENT">
                                    <RegisterCoursePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/courses" replace />} />
                    </Routes>
                </main>
            </AuthProvider>
        </BrowserRouter>
    );
}
