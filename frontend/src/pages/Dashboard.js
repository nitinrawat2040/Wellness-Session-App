import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, Plus, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const Dashboard = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/sessions`);
            setSessions(response.data.sessions);
        } catch (err) {
            setError('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.tags && session.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    // Sort filteredSessions by updated_at ascending
    const sortedSessions = [...filteredSessions].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading sessions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Main Header Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '48px',
                padding: '40px 0'
            }}>
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '16px'
                }}>
                    Discover Wellness Sessions
                </h1>
                <p style={{
                    fontSize: '18px',
                    color: '#6c757d',
                    marginBottom: '32px',
                    maxWidth: '600px',
                    margin: '0 auto 32px auto'
                }}>
                    Explore yoga, meditation, and mindfulness sessions created by our community
                </p>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginBottom: '32px',
                    flexWrap: 'wrap'
                }}>
                    <Link to="/editor" className="btn btn-primary" style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgb(67, 184, 67)',
                        color: 'white',
                        border: 'none'
                    }}>
                        <Plus size={20} />
                        Create Your Session
                    </Link>
                    <Link to="/my-sessions" className="btn btn-secondary" style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        View My Sessions
                    </Link>
                </div>

                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <Search size={20} style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6c757d'
                    }} />
                    <input
                        type="text"
                        placeholder="Search sessions by title or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 16px 16px 48px',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Sessions Grid */}
            {sortedSessions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
                    <h3 style={{ marginBottom: '16px', color: '#333' }}>
                        No sessions available
                    </h3>
                    <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                        Be the first to create a wellness session for the community!
                    </p>
                    <Link to="/editor" className="btn btn-primary">
                        <Plus size={20} />
                        Create First Session
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
                                    justifyContent: 'flex-end',
                                    marginTop: 'auto',
                                    paddingTop: '16px'
                                }}>
                                    <a
                                        href={session.json_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: 'rgb(67, 184, 67)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <ExternalLink size={14} />
                                        View Session
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard; 