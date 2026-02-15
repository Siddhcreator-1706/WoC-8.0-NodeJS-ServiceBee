const nodemailer = require('nodemailer');

// Create transporter with env config
const createTransporter = () => {
    const port = Number.parseInt(process.env.SMTP_PORT, 10) || 587;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
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

// Email Template Helper
const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px; text-align: center; border-bottom: 1px solid #27272a; background: linear-gradient(to right, #18181b, #27272a, #18181b);">
                            <h1 style="margin: 0; color: #f4f4f5; font-size: 24px; letter-spacing: 1px; font-weight: 700;">PHANTOM AGENCY</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #e4e4e7; font-size: 20px; font-weight: 600;">${title}</h2>
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #121215; border-top: 1px solid #27272a;">
                            <p style="margin: 0; color: #71717a; font-size: 12px;">&copy; ${new Date().getFullYear()} Phantom Agency. All rights reserved.</p>
                            <p style="margin: 10px 0 0 0; color: #52525b; font-size: 11px;">Automated message. Please do not reply.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);

    const content = `
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello <strong style="color: #f4f4f5;">${escapeHtml(name)}</strong>,</p>
        <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">Your verification code for secure access is:</p>
        
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 700; color: #a78bfa; letter-spacing: 8px;">${otp}</span>
        </div>

        <p style="margin: 0; color: #71717a; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
    `;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: 'Verification Code - Phantom Agency',
        html: getEmailTemplate('Verify Your Identity', content)
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

    const content = `
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello <strong style="color: #f4f4f5;">${escapeHtml(name)}</strong>,</p>
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new secure password:</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #f97316; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); display: inline-block;">Reset Password</a>
        </div>

        <p style="margin: 0 0 10px 0; color: #71717a; font-size: 13px;">Or copy this link to your browser:</p>
        <p style="margin: 0 0 20px 0; color: #f97316; font-size: 13px; word-break: break-all;"><a href="${resetUrl}" style="color: #f97316; text-decoration: none;">${resetUrl}</a></p>
        <p style="margin: 0; color: #71717a; font-size: 13px;">This link is valid for <strong>1 hour</strong>.</p>
    `;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: 'Password Reset Request - Phantom Agency',
        html: getEmailTemplate('Reset Your Password', content)
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
        'pending': '#f59e0b',       // Amber
        'in-progress': '#3b82f6',   // Blue
        'resolved': '#10b981',      // Emerald
        'rejected': '#ef4444',      // Red
        'service-unavailable': '#71717a' // Zinc
    };

    const statusColor = statusColors[newStatus] || '#71717a';
    const statusText = newStatus.replace(/-/g, ' ').toUpperCase();

    const content = `
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello <strong style="color: #f4f4f5;">${escapeHtml(name)}</strong>,</p>
        <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">The status of your complaint has been updated.</p>

        <div style="background-color: #27272a; border-radius: 12px; padding: 25px; border: 1px solid #3f3f46; margin: 25px 0;">
            <div style="margin-bottom: 16px;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Subject</span>
                <span style="color: #f4f4f5; font-size: 16px; font-weight: 500;">${escapeHtml(complaint.subject)}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Service</span>
                <span style="color: #a1a1aa; font-size: 15px;">${escapeHtml(complaint.serviceSnapshot?.name || 'N/A')}</span>
            </div>

            <div style="padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">New Status</span>
                <span style="display: inline-block; background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">${statusText}</span>
            </div>

            ${complaint.adminResponse ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Admin Response</span>
                <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(complaint.adminResponse)}</p>
            </div>` : ''}
            
            ${complaint.serviceProviderResponse ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Provider Response</span>
                <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(complaint.serviceProviderResponse)}</p>
            </div>` : ''}
        </div>

        <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;">You can track this complaint in your <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #a1a1aa; text-decoration: underline;">dashboard</a>.</p>
    `;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: `Status Update: ${statusText} - Phantom Agency`,
        html: getEmailTemplate('Complaint Status Update', content)
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

// Send service action email (deletion/suspension)
const sendServiceActionEmail = async (email, serviceName, action, reason, name = 'Partner') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);

    const actionColors = {
        'deleted': '#ef4444', // Red
        'suspended': '#f59e0b' // Amber
    };

    const actionColor = actionColors[action] || '#71717a';
    const actionText = action.toUpperCase();

    const content = `
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello <strong style="color: #f4f4f5;">${escapeHtml(name)}</strong>,</p>
        <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">Important update regarding your service listing.</p>

        <div style="background-color: #27272a; border-radius: 12px; padding: 25px; border: 1px solid #3f3f46; margin: 25px 0;">
            <div style="margin-bottom: 16px;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Service Name</span>
                <span style="color: #f4f4f5; font-size: 16px; font-weight: 500;">${escapeHtml(serviceName)}</span>
            </div>
            
            <div style="padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Action Taken</span>
                <span style="display: inline-block; background-color: ${actionColor}20; color: ${actionColor}; border: 1px solid ${actionColor}40; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">${actionText}</span>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Reason</span>
                <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(reason || 'Violation of terms of service.')}</p>
            </div>
        </div>

        <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;">If you believe this is an error, please contact support.</p>
    `;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: `Service ${actionText}: ${serviceName} - Phantom Agency`,
        html: getEmailTemplate(`Service ${actionText}`, content)
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send account action email (ban/unban/delete)
const sendAccountActionEmail = async (email, action, reason, name = 'User') => {
    const transporter = createTransporter();
    const cleanEmail = sanitizeEmail(email);

    const actionColors = {
        'banned': '#ef4444',      // Red
        'deleted': '#ef4444',     // Red
        'reactivated': '#10b981'  // Emerald
    };

    const actionColor = actionColors[action] || '#71717a';
    const actionText = action.toUpperCase();

    const content = `
        <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello <strong style="color: #f4f4f5;">${escapeHtml(name)}</strong>,</p>
        <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">Important update regarding your account status.</p>

        <div style="background-color: #27272a; border-radius: 12px; padding: 25px; border: 1px solid #3f3f46; margin: 25px 0;">
            <div style="margin-bottom: 16px;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Account Status</span>
                <span style="display: inline-block; background-color: ${actionColor}20; color: ${actionColor}; border: 1px solid ${actionColor}40; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">${actionText}</span>
            </div>

            ${reason ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3f3f46;">
                <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Reason / Details</span>
                <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(reason)}</p>
            </div>` : ''}
        </div>

        <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;">If you have questions, please contact our support team.</p>
    `;

    const mailOptions = {
        from: getFromAddress(),
        to: cleanEmail,
        subject: `Account Update: ${actionText} - Phantom Agency`,
        html: getEmailTemplate(`Account ${actionText}`, content)
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendPasswordResetEmail,
    sendComplaintStatusEmail,
    sendServiceActionEmail,
    sendAccountActionEmail,
    sanitizeEmail,
    escapeHtml
};
