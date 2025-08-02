import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TestRoute from './pages/TestRoute';
import SimpleTest from './pages/SimpleTest';
import Dashboard from './pages/Dashboard';
import MySessions from './pages/MySessions';
import SessionEditor from './pages/SessionEditor';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
};

// Main App Component
const AppContent = () => {
    const location = useLocation();
    const { user, loading } = useAuth();

    // Show navbar only on protected routes (when user is logged in)
    const showNavbar = user && !['/login', '/register', '/forgot-password'].includes(location.pathname) && !location.pathname.startsWith('/reset-password');

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '18px',
                color: '#6c757d'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div className="App">
            {showNavbar && <Navbar />}
            <main className="container" style={{ paddingTop: showNavbar ? '20px' : '0', paddingBottom: '40px' }}>
                <Routes>
                    <Route path="/test" element={<TestRoute />} />
                    <Route path="/simple" element={<SimpleTest />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/my-sessions" element={
                        <ProtectedRoute>
                            <MySessions />
                        </ProtectedRoute>
                    } />
                    <Route path="/editor" element={
                        <ProtectedRoute>
                            <SessionEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="/editor/:id" element={
                        <ProtectedRoute>
                            <SessionEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
};

// App with Auth Provider
const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App; 