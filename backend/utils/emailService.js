const nodemailer = require('nodemailer');

// Create transporter with env config
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Get from address from env
const getFromAddress = () => {
    const fromName = process.env.FROM_NAME || 'ServiceBee';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    return `"${fromName} 🎃" <${fromEmail}>`;
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sanitize email (preserve dots, remove whitespace, lowercase)
const sanitizeEmail = (email) => {
    if (!email) return '';
    return email.trim().toLowerCase();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: '🎃 ServiceBee - Email Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px;">
                <h1 style="color: #ff6600; text-align: center; font-size: 28px;">🎃 ServiceBee</h1>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #fff; font-size: 16px;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                    <p style="color: #ccc;">Your verification code is:</p>
                    <div style="background: #ff6600; color: #fff; font-size: 32px; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 8px; font-weight: bold;">
                        ${otp}
                    </div>
                    <p style="color: #ccc; margin-top: 20px;">This code expires in <strong>10 minutes</strong>.</p>
                    <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
                <p style="color: #666; text-align: center; font-size: 12px;">© 2024 ServiceBee. All rights reserved.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: '🔐 ServiceBee - Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px;">
                <h1 style="color: #ff6600; text-align: center; font-size: 28px;">🎃 ServiceBee</h1>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #fff; font-size: 16px;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                    <p style="color: #ccc;">You requested a password reset. Click the button below:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetUrl}" style="background: #ff6600; color: #fff; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #ccc;">Or copy this link: <a href="${resetUrl}" style="color: #ff6600;">${resetUrl}</a></p>
                    <p style="color: #ccc;">This link expires in <strong>1 hour</strong>.</p>
                </div>
                <p style="color: #666; text-align: center; font-size: 12px;">© 2024 ServiceBee. All rights reserved.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send complaint status update email
const sendComplaintStatusEmail = async (email, complaint, newStatus, name = 'User') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);

    const statusColors = {
        'pending': '#ffc107',
        'in-progress': '#17a2b8',
        'resolved': '#28a745',
        'rejected': '#dc3545',
        'service-unavailable': '#6c757d'
    };

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: `📢 ServiceBee - Complaint Status Updated: ${newStatus.toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px;">
                <h1 style="color: #ff6600; text-align: center; font-size: 28px;">🎃 ServiceBee</h1>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #fff; font-size: 16px;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                    <p style="color: #ccc;">Your complaint status has been updated:</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="color: #fff; margin: 5px 0;"><strong>Subject:</strong> ${escapeHtml(complaint.subject)}</p>
                        <p style="color: #fff; margin: 5px 0;"><strong>Service:</strong> ${escapeHtml(complaint.serviceSnapshot?.name || 'N/A')}</p>
                        <p style="margin: 5px 0;">
                            <strong style="color: #fff;">Status:</strong> 
                            <span style="background: ${statusColors[newStatus] || '#666'}; color: #fff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-size: 12px;">${newStatus}</span>
                        </p>
                        ${complaint.adminResponse ? `<p style="color: #ccc; margin-top: 10px;"><strong>Response:</strong><br>${escapeHtml(complaint.adminResponse)}</p>` : ''}
                        ${complaint.serviceProviderResponse ? `<p style="color: #ccc; margin-top: 10px;"><strong>Service Provider Response:</strong><br>${escapeHtml(complaint.serviceProviderResponse)}</p>` : ''}
                    </div>
                    <p style="color: #888; font-size: 12px;">You can view your complaints in your account dashboard.</p>
                </div>
                <p style="color: #666; text-align: center; font-size: 12px;">© 2024 ServiceBee. All rights reserved.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// HTML escape helper (prevent XSS in emails)
const escapeHtml = (text) => {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendPasswordResetEmail,
    sendComplaintStatusEmail,
    sanitizeEmail,
    escapeHtml
};
