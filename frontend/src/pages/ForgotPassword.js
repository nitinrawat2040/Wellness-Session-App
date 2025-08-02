import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${config.apiUrl}/auth/forgot-password`, { email });
            toast.success(response.data.message);
            setSubmitted(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to send reset email';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
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
                            <Mail size={24} color="white" />
                        </div>
                        <h2 style={{
                            color: '#333',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '16px'
                        }}>
                            Check Your Email
                        </h2>
                        <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '16px' }}>
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '16px' }}
                        >
                            Try Again
                        </button>
                        <Link to="/login" className="btn btn-secondary" style={{ width: '100%', display: 'block' }}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
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
                        Forgot Password?
                    </h2>
                    <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={16} style={{ marginRight: '8px' }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword; 