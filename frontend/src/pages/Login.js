import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    return (
        <div>
            {/* Navbar */}
            <nav style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                {/* Left side - Brand */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🌿 Wellness Sessions
                    </Link>
                </div>

                {/* Right side - Empty for now */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Navigation buttons removed as requested */}
                </div>
            </nav>

            {/* Login Form */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)',
                padding: '24px'
            }}>
                <div className="card" style={{
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '32px',
                        color: '#111827',
                        fontSize: '28px',
                        fontWeight: '700'
                    }}>
                        Welcome Back
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={16} style={{ marginRight: '8px' }} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} style={{ marginRight: '8px' }} />
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6c757d'
                                    }}
                                >

                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                <Link
                                    to="/forgot-password"
                                    className="forgot-password-link"
                                    style={{
                                        color: 'rgb(111, 163, 231)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e9ecef'
                    }}>
                        <p style={{ color: '#6c757d', marginBottom: '16px' }}>
                            Don't have an account?
                        </p>
                        <Link to="/register" className="btn btn-secondary">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 