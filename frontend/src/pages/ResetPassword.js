import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';

// Custom Eye Icon with Slash for hidden password
const EyeWithSlash = ({ size = 20, color = '#6c7280' }) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
        <Eye size={size} color={color} />
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '2px',
            backgroundColor: color,
            transform: 'translateY(-50%) rotate(-45deg)',
            transformOrigin: 'center'
        }} />
    </div>
);

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            await axios.get(`${config.apiUrl}/auth/verify-reset-token/${token}`);
            setTokenValid(true);
        } catch (error) {
            toast.error('Invalid or expired reset link');
            setTokenValid(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${config.apiUrl}/auth/reset-password`, {
                token,
                password: formData.password
            });

            toast.success('Password reset successfully!');
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to reset password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <h2 style={{ color: '#333', marginBottom: '16px' }}>Verifying Reset Link...</h2>
                    <p style={{ color: '#6c757d' }}>Please wait while we verify your reset link.</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <h2 style={{ color: '#333', marginBottom: '16px' }}>Invalid Reset Link</h2>
                    <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary">
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgb(118, 214, 118)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <CheckCircle size={24} color="white" />
                        </div>
                        <h2 style={{
                            color: '#333',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '16px'
                        }}>
                            Password Reset Successfully!
                        </h2>
                        <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                            Your password has been updated. You will be redirected to the login page shortly.
                        </p>
                    </div>

                    <Link to="/login" className="btn btn-primary">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/login" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#6c757d',
                        textDecoration: 'none',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}>
                        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                        Back to Login
                    </Link>
                    <h2 style={{
                        color: '#333',
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '16px'
                    }}>
                        Reset Your Password
                    </h2>
                    <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: '8px' }} />
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your new password"
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
                                {showPassword ? <Eye size={20} /> : <EyeWithSlash size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: '8px' }} />
                            Confirm New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Confirm your new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                {showConfirmPassword ? <Eye size={20} /> : <EyeWithSlash size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 