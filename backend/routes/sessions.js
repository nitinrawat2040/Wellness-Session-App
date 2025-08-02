const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/sessions - Public wellness sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find({ status: 'published' })
            .populate('user_id', 'username')
            .sort({ created_at: -1 });

        res.json({
            sessions: sessions.map(session => ({
                id: session._id,
                title: session.title,
                tags: session.tags,
                json_file_url: session.json_file_url,
                status: session.status,
                created_at: session.created_at,
                updated_at: session.updated_at,
                author: session.user_id.username
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/sessions/my-sessions - User's own sessions (draft + published)
router.get('/my-sessions', auth, async (req, res) => {
    try {
        const sessions = await Session.find({ user_id: req.user._id })
            .sort({ updated_at: -1 });

        res.json({
            sessions: sessions.map(session => ({
                id: session._id,
                title: session.title,
                tags: session.tags,
                json_file_url: session.json_file_url,
                status: session.status,
                created_at: session.created_at,
                updated_at: session.updated_at
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/sessions/my-sessions/:id - View a single user session
router.get('/my-sessions/:id', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            user_id: req.user._id
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            session: {
                id: session._id,
                title: session.title,
                tags: session.tags,
                json_file_url: session.json_file_url,
                status: session.status,
                created_at: session.created_at,
                updated_at: session.updated_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/sessions/my-sessions/save-draft - Save or update a draft session
router.post('/my-sessions/save-draft', auth, [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('json_file_url')
        .optional()
        .isLength({ min: 0 })
        .withMessage('JSON file URL must not be empty if provided')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, tags, json_file_url, sessionId } = req.body;

        let session;
        if (sessionId) {
            // Update existing session
            session = await Session.findOne({
                _id: sessionId,
                user_id: req.user._id
            });

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            session.title = title;
            session.tags = tags || [];
            session.json_file_url = json_file_url || '';
            session.updated_at = new Date();
        } else {
            // For new sessions, always check if a draft with this title already exists
            const existingDraft = await Session.findOne({
                user_id: req.user._id,
                title: title,
                status: 'draft'
            });

            if (existingDraft) {
                // Update existing draft instead of creating new one
                existingDraft.tags = tags || [];
                existingDraft.json_file_url = json_file_url || '';
                existingDraft.updated_at = new Date();
                session = existingDraft;
            } else {
                // Create new draft session only if no draft with this title exists
                session = new Session({
                    user_id: req.user._id,
                    title,
                    tags: tags || [],
                    json_file_url: json_file_url || '',
                    status: 'draft'
                });
            }
        }

        await session.save();

        res.json({
            message: 'Draft saved successfully',
            session: {
                id: session._id,
                title: session.title,
                tags: session.tags,
                json_file_url: session.json_file_url,
                status: session.status,
                created_at: session.created_at,
                updated_at: session.updated_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// POST /api/sessions/my-sessions/publish - Publish a session
router.post('/my-sessions/publish', auth, [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('json_file_url')
        .notEmpty()
        .withMessage('JSON file URL is required')
        .isURL()
        .withMessage('Please provide a valid URL'),
    body('sessionId')
        .optional()
        .isMongoId()
        .withMessage('Invalid session ID')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, tags, json_file_url, sessionId } = req.body;

        let session;
        if (sessionId) {
            // Update existing session
            session = await Session.findOne({
                _id: sessionId,
                user_id: req.user._id
            });

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            session.title = title;
            session.tags = tags || [];
            session.json_file_url = json_file_url;
            session.status = 'published';
            session.updated_at = new Date();
        } else {
            // Create new published session
            session = new Session({
                user_id: req.user._id,
                title,
                tags: tags || [],
                json_file_url,
                status: 'published'
            });
        }

        await session.save();

        res.json({
            message: 'Session published successfully',
            session: {
                id: session._id,
                title: session.title,
                tags: session.tags,
                json_file_url: session.json_file_url,
                status: session.status,
                created_at: session.created_at,
                updated_at: session.updated_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/sessions/my-sessions/:id - Delete a session
router.delete('/my-sessions/:id', auth, async (req, res) => {
    try {
        const session = await Session.findOneAndDelete({
            _id: req.params.id,
            user_id: req.user._id
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 