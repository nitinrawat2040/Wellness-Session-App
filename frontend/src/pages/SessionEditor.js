import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Send, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../config';

const SessionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        tags: [],
        json_file_url: ''
    });

    const [tagInput, setTagInput] = useState('');

    // Auto-save timer
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const [draftId, setDraftId] = useState(null);

    // Use ref to store the latest autoSave function
    const autoSaveRef = useRef();

    const loadSession = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/sessions/my-sessions/${id}`);
            const session = response.data.session;
            setFormData({
                title: session.title,
                tags: session.tags || [],
                json_file_url: session.json_file_url
            });

            // Initialize the draft ID
            setDraftId(session._id);
        } catch (error) {
            toast.error('Failed to load session');
            navigate('/my-sessions');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Load existing session if editing
    useEffect(() => {
        if (id) {
            loadSession();
        }
    }, [id, loadSession]);

    // Cleanup auto-save timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [autoSaveTimer]);

    // Auto-save functionality - simple approach
    const autoSave = useCallback(async () => {

        if (!formData.title.trim()) {
            return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication required');
            return;
        }

        try {
            const requestData = {
                ...formData,
                sessionId: id || draftId // Use existing session ID or draft ID
            };

            const response = await axios.post(`${config.apiUrl}/sessions/my-sessions/save-draft`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update the draft ID if this is a new draft
            if (response.data.session && (!id && !draftId)) {
                setDraftId(response.data.session.id);

            }

            toast.success('Draft saved');
        } catch (error) {

            if (error.response?.status === 401) {
                toast.error('Authentication failed');
            } else if (error.response?.status === 500) {
                toast.error('Server error');
            } else {
                toast.error('Save failed');
            }
        }
    }, [formData, id, draftId]);

    // Store the autoSave function in ref
    autoSaveRef.current = autoSave;

    // Simple auto-save effect - triggers after 5 seconds of any form change
    useEffect(() => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        // Auto-save if we have a title (URL is optional for drafts)
        if (formData.title.trim()) {
            const timer = setTimeout(() => {
                if (autoSaveRef.current) {
                    autoSaveRef.current();
                }
            }, 5000); // 5 second delay
            setAutoSaveTimer(timer);
        }

        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [formData.title, formData.json_file_url, formData.tags]); // Only depend on form data, not the function

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSaveDraft = async () => {
        if (!formData.title.trim() || !formData.json_file_url.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            const response = await axios.post(`${config.apiUrl}/sessions/my-sessions/save-draft`, {
                ...formData,
                sessionId: id || draftId
            });

            if (!id) {
                // If this was a new session, update the URL with the new ID
                navigate(`/editor/${response.data.session.id}`);
                setDraftId(response.data.session.id);
            }

            toast.success('Draft saved successfully');
        } catch (error) {
            toast.error('Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formData.title.trim() || !formData.json_file_url.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setPublishing(true);
            const response = await axios.post(`${config.apiUrl}/sessions/my-sessions/publish`, {
                ...formData,
                sessionId: id || draftId
            });

            if (!id) {
                // If this was a new session, update the URL with the new ID
                navigate(`/editor/${response.data.session.id}`);
                setDraftId(response.data.session.id);
            }

            toast.success('Session published successfully!');
            navigate('/my-sessions');
        } catch (error) {
            toast.error('Failed to publish session');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div>Loading session editor...</div>
            </div>
        );
    }

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
                        {id ? 'Edit Session' : 'Create New Session'}
                    </h1>
                    <p style={{ color: '#000000', fontSize: '16px' }}>
                        {id ? 'Update your wellness session' : 'Create a new wellness session for the community'}
                    </p>
                </div>


            </div>

            <div className="card">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="form-label">Session Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter session title (e.g., Morning Yoga Flow)"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tags</label>
                        <div className="tag-input">
                            {formData.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="tag-remove"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                onBlur={addTag}
                                placeholder="Add tags (press Enter or comma)"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    minWidth: '120px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <small style={{ color: '#6c757d', marginTop: '8px', display: 'block' }}>
                            Add relevant tags to help others discover your session (e.g., yoga, meditation, beginner)
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">File URL *</label>
                        <input
                            type="url"
                            name="json_file_url"
                            value={formData.json_file_url}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="https://example.com/session-data.json"
                            required
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginTop: '32px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="btn btn-secondary"
                            disabled={saving || publishing}
                            style={{ flex: 1, minWidth: '200px' }}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save as Draft'}
                        </button>

                        <button
                            type="button"
                            onClick={handlePublish}
                            className="btn btn-success"
                            disabled={saving || publishing}
                            style={{ flex: 1, minWidth: '200px' }}
                        >
                            <Send size={20} />
                            {publishing ? 'Publishing...' : 'Publish Session'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#333' }}>Auto-Save Information</h3>
                <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                    Your session will be automatically saved as a draft every 5 seconds after you type anything in the text fields.You can also manually save as draft or publish when you're ready to share with the community.
                </p>
            </div>
        </div>
    );
};

export default SessionEditor;