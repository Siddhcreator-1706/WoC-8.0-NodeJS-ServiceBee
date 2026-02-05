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
    const fromName = process.env.FROM_NAME || 'Phantom Agency';
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
        subject: '🎃 Phantom Agency - Email Verification OTP',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f0f1a;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 10px;">
                    <tr><td style="padding: 30px 20px;">
                        <h1 style="color: #ff6600; text-align: center; font-size: 28px; margin: 0 0 20px 0;">🎃 Phantom Agency</h1>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <tr><td style="padding: 20px;">
                                <p style="color: #fff; font-size: 16px; margin: 0 0 10px 0;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                                <p style="color: #ccc; margin: 0 0 15px 0;">Your verification code is:</p>
                                <div style="background: #ff6600; color: #fff; font-size: 28px; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 6px; font-weight: bold;">${otp}</div>
                                <p style="color: #ccc; margin: 15px 0 5px 0;">This code expires in <strong>10 minutes</strong>.</p>
                                <p style="color: #888; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
                            </td></tr>
                        </table>
                        <p style="color: #666; text-align: center; font-size: 12px; margin: 20px 0 0 0;">© ${new Date().getFullYear()} Phantom Agency. All rights reserved.</p>
                    </td></tr>
                </table>
            </body>
            </html>
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
        subject: '🔐 Phantom Agency - Password Reset Request',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f0f1a;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 10px;">
                    <tr><td style="padding: 30px 20px;">
                        <h1 style="color: #ff6600; text-align: center; font-size: 28px; margin: 0 0 20px 0;">🎃 Phantom Agency</h1>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <tr><td style="padding: 20px;">
                                <p style="color: #fff; font-size: 16px; margin: 0 0 10px 0;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                                <p style="color: #ccc; margin: 0 0 20px 0;">You requested a password reset. Click the button below:</p>
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${resetUrl}" style="background: #ff6600; color: #fff; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
                                </div>
                                <p style="color: #ccc; word-break: break-all; margin: 0 0 10px 0;">Or copy this link: <a href="${resetUrl}" style="color: #ff6600;">${resetUrl}</a></p>
                                <p style="color: #ccc; margin: 0;">This link expires in <strong>1 hour</strong>.</p>
                            </td></tr>
                        </table>
                        <p style="color: #666; text-align: center; font-size: 12px; margin: 20px 0 0 0;">© ${new Date().getFullYear()} Phantom Agency. All rights reserved.</p>
                    </td></tr>
                </table>
            </body>
            </html>
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
        subject: `📢 Phantom Agency - Complaint Status Updated: ${newStatus.toUpperCase()}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f0f1a;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 10px;">
                    <tr><td style="padding: 30px 20px;">
                        <h1 style="color: #ff6600; text-align: center; font-size: 28px; margin: 0 0 20px 0;">🎃 Phantom Agency</h1>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <tr><td style="padding: 20px;">
                                <p style="color: #fff; font-size: 16px; margin: 0 0 10px 0;">Hello <strong>${escapeHtml(name)}</strong>,</p>
                                <p style="color: #ccc; margin: 0 0 15px 0;">Your complaint status has been updated:</p>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0,0,0,0.3); border-radius: 8px;">
                                    <tr><td style="padding: 15px;">
                                        <p style="color: #fff; margin: 0 0 8px 0;"><strong>Subject:</strong> ${escapeHtml(complaint.subject)}</p>
                                        <p style="color: #fff; margin: 0 0 8px 0;"><strong>Service:</strong> ${escapeHtml(complaint.serviceSnapshot?.name || 'N/A')}</p>
                                        <p style="margin: 0 0 8px 0;"><strong style="color: #fff;">Status:</strong> <span style="background: ${statusColors[newStatus] || '#666'}; color: #fff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-size: 12px;">${newStatus}</span></p>
                                        ${complaint.adminResponse ? `<p style="color: #ccc; margin: 10px 0 0 0;"><strong>Response:</strong><br>${escapeHtml(complaint.adminResponse)}</p>` : ''}
                                        ${complaint.serviceProviderResponse ? `<p style="color: #ccc; margin: 10px 0 0 0;"><strong>Provider Response:</strong><br>${escapeHtml(complaint.serviceProviderResponse)}</p>` : ''}
                                    </td></tr>
                                </table>
                                <p style="color: #888; font-size: 12px; margin: 15px 0 0 0;">You can view your complaints in your account dashboard.</p>
                            </td></tr>
                        </table>
                        <p style="color: #666; text-align: center; font-size: 12px; margin: 20px 0 0 0;">© ${new Date().getFullYear()} Phantom Agency. All rights reserved.</p>
                    </td></tr>
                </table>
            </body>
            </html>
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
