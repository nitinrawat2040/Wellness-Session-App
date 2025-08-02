const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_\s]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user already exists 
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {

            return res.json({
                message: 'If this email exists, the Reset password link has been sent.'
            });
        }


        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email using SendGrid
        try {
            const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

            const msg = {
                to: email,
                from: 'nitinrawat2040@gmail.com',
                subject: 'Password Reset Request - Wellness Sessions',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                        <p>Hello ${user.username},</p>
                        <p>You requested a password reset for your Wellness Sessions account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: rgb(111, 163, 231); 
                                      color: white; 
                                      padding: 12px 24px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request this password reset, please ignore this email.</p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 14px; text-align: center;">
                            Best regards,<br>
                            Wellness Sessions Team
                        </p>
                    </div>
                `
            };

            await sgMail.send(msg);

        } catch (emailError) {
            // Log the reset link to console as fallback
        }

        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during password reset request' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update password and clear reset token
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error during password reset' });
    }
});

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        res.json({ message: 'Valid reset token' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Test email configuration endpoint
router.get('/test-email', async (req, res) => {
    try {
        res.json({
            message: 'Email configuration logged to console',
            sendgridApiKey: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET',
            apiKeyPreview: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 10) + '...' : 'NOT SET'
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/send-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;


        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }


        if (!process.env.SENDGRID_API_KEY) {
            return res.status(500).json({ error: 'SendGrid API key not configured' });
        }

        const msg = {
            to: email,
            from: 'nitinrawat0053@gmail.com',
            subject: 'Your Wellness Session OTP',
            text: `Your OTP is: ${otp}`,
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        };

        await sgMail.send(msg);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
});

// Simple test endpoint without SendGrid
router.post('/test-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({
            message: 'Test OTP endpoint working',
            receivedEmail: email,
            receivedOtp: otp,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Test endpoint failed' });
    }
});

// Test SendGrid configuration
router.get('/test-sendgrid-config', async (req, res) => {
    try {
        res.json({
            apiKeyExists: !!process.env.SENDGRID_API_KEY,
            apiKeyPreview: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 10) + '...' : 'NOT SET',
            senderEmail: 'nitinrawat0053@gmail.com',
            clientUrl: process.env.CLIENT_URL,
            message: 'Check server console for detailed configuration'
        });
    } catch (error) {
        res.status(500).json({ error: 'Configuration test failed' });
    }
});

// Test email delivery with detailed logging
router.post('/test-email-delivery', async (req, res) => {
    try {
        const { email } = req.body;

        const msg = {
            to: email,
            from: 'nitinrawat0053@gmail.com',
            subject: 'Test Email - Wellness Sessions',
            text: 'This is a test email from Wellness Sessions',
            html: '<p>This is a <strong>test email</strong> from Wellness Sessions</p>'
        };

        const result = await sgMail.send(msg);

        res.json({
            success: true,
            message: 'Test email sent successfully',
            messageId: result[0]?.headers?.['x-message-id'] || 'unknown'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Email delivery test failed',
            details: error.response?.body || error.message
        });
    }
});

// Test SendGrid with different sender formats
router.post('/test-sendgrid', async (req, res) => {
    try {
        const { email } = req.body;

        // Test 1: Simple email
        try {
            const msg1 = {
                to: email,
                from: 'nitinrawat0053@gmail.com',
                subject: 'Test 1 - Simple Format',
                text: 'This is test 1'
            };
            await sgMail.send(msg1);
            return res.json({ success: true, method: 'simple format' });
        } catch (error1) {
            return res.json({ success: false, method: 'simple format', error: error1.response?.body?.errors?.[0]?.message });
        }

        // Test 2: With name
        try {
            const msg2 = {
                to: email,
                from: 'Nitin Singh Rawat <nitinrawat0053@gmail.com>',
                subject: 'Test 2 - With Name',
                text: 'This is test 2'
            };
            await sgMail.send(msg2);
            return res.json({ success: true, method: 'with name' });
        } catch (error2) {
            return res.json({ success: false, method: 'with name', error: error2.response?.body?.errors?.[0]?.message });
        }

        // Test 3: Object format
        try {
            const msg3 = {
                to: email,
                from: {
                    email: 'nitinrawat0053@gmail.com',
                    name: 'Nitin Singh Rawat'
                },
                subject: 'Test 3 - Object Format',
                text: 'This is test 3'
            };
            await sgMail.send(msg3);
            return res.json({ success: true, method: 'object format' });
        } catch (error3) {
            return res.json({ success: false, method: 'object format', error: error3.response?.body?.errors?.[0]?.message });
        }

        res.status(500).json({ error: 'All SendGrid tests failed' });

    } catch (error) {
        res.status(500).json({ error: 'Test failed' });
    }
});

module.exports = router; 