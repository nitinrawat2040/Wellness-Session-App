import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../config';

const MySessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    useEffect(() => {
        fetchMySessions();
    }, []);

    // Add a listener for when the page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchMySessions();
            }
        };

        const handleFocus = () => {
            fetchMySessions();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchMySessions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/sessions/my-sessions`);
            setSessions(response.data.sessions);
            setError(null);
        } catch (error) {
            setError('Failed to load your sessions');
            toast.error('Failed to load your sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sessionId) => {

        // Set the session to delete and show the dialog
        setSessionToDelete(sessionId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!sessionToDelete) return;

        try {
            await axios.delete(`${config.apiUrl}/sessions/my-sessions/${sessionToDelete}`);
            setSessions(sessions.filter(session => session.id !== sessionToDelete));
            toast.success('Session deleted successfully');
        } catch (error) {
            toast.error('Failed to delete session');
        } finally {
            setShowDeleteDialog(false);
            setSessionToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setSessionToDelete(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading">
                <div>Loading your sessions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                {error}
                <button
                    onClick={fetchMySessions}
                    className="btn btn-primary"
                    style={{ marginLeft: '16px' }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Sort sessions by updated_at ascending
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '8px'
                    }}>
                        My Sessions
                    </h1>
                    <p style={{ color: '#000000', fontSize: '16px' }}>
                        Manage your wellness sessions and drafts
                    </p>
                </div>
            </div>

            {sortedSessions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ marginBottom: '16px', color: '#333' }}>
                        No sessions yet
                    </h3>
                    <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                        Start creating your wellness sessions and share them with the community!
                    </p>
                    <Link to="/editor" className="btn btn-primary">
                        <Plus size={20} />
                        Create Your First Session
                    </Link>
                </div>
            ) : (
                <div className="session-grid">
                    {sortedSessions.map((session) => (
                        <div key={session.id} className="session-card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}>
                            <div className="session-header">
                                <h3 className="session-title">{session.title}</h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Calendar size={16} style={{ color: 'rgb(97, 171, 196)' }} />
                                        <span style={{ color: 'rgb(97, 171, 196)', fontSize: '14px' }}>
                                            {formatDate(session.updated_at)}
                                        </span>
                                    </div>
                                    <span className={`session-status status-${session.status}`}>
                                        {session.status}
                                    </span>
                                </div>
                            </div>

                            <div className="session-body" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1
                            }}>
                                {session.tags && session.tags.length > 0 && (
                                    <div className="session-tags">
                                        {session.tags.map((tag, index) => (
                                            <span key={index} className="session-tag">
                                                <Tag size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: 'auto',
                                    paddingTop: '16px'
                                }}>
                                    <Link
                                        to={`/editor/${session.id}`}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(session.id)}
                                        className="btn btn-danger"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#f8d7da',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            border: '3px solid #f5c6cb'
                        }}>
                            <Trash2 size={24} style={{ color: '#721c24' }} />
                        </div>

                        <h3 style={{
                            marginBottom: '16px',
                            color: '#333',
                            fontSize: '20px',
                            fontWeight: '600'
                        }}>
                            Delete Session
                        </h3>

                        <p style={{
                            color: '#6c757d',
                            marginBottom: '24px',
                            fontSize: '16px',
                            lineHeight: '1.5'
                        }}>
                            Are you sure you want to delete this session?
                        </p>

                        <p style={{
                            color: '#dc3545',
                            fontSize: '14px',
                            marginBottom: '24px',
                            fontStyle: 'italic'
                        }}>
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #6c757d',
                                    backgroundColor: 'white',
                                    color: '#6c757d',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#6c757d';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#6c757d';
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #dc3545',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#c82333';
                                    e.target.style.borderColor = '#c82333';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#dc3545';
                                    e.target.style.borderColor = '#dc3545';
                                }}
                            >
                                Delete Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySessions; 