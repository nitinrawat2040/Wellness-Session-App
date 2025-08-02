import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Plus, Home, FileText, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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

            {/* Right side - Navigation and User */}
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* Dashboard Link */}
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        ':hover': {
                            backgroundColor: '#f3f4f6'
                        }
                    }}>
                        <Home size={18} />
                        Dashboard
                    </Link>

                    {/* Conditional Navigation Links */}
                    {location.pathname === '/my-sessions' && (
                        <Link to="/editor" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff'
                        }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                        >
                            <Plus size={18} />
                            Create Session
                        </Link>
                    )}

                    {location.pathname === '/editor' && (
                        <Link to="/my-sessions" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff'
                        }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                        >
                            <FileText size={18} />
                            View Sessions
                        </Link>
                    )}

                    {/* User Profile Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                color: '#374151',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #e5e7eb'
                            }}>
                                <User size={16} style={{ color: '#6b7280' }} />
                            </div>
                            <span style={{ color: '#374151', fontWeight: '500' }}>
                                {user.username}
                            </span>
                            <ChevronDown size={16} style={{ color: '#6b7280' }} />
                        </button>

                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                minWidth: '180px',
                                zIndex: 1000,
                                marginTop: '8px',
                                padding: '4px 0'
                            }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        color: '#374151',
                                        fontSize: '14px',
                                        transition: 'background-color 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} style={{ color: '#6b7280' }} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 