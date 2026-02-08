/**
 * Email utility using Brevo (Sendinblue) HTTP API
 * This approach avoids SDK compatibility issues
 */

/**
 * Send email via Brevo API
 */
const sendBrevoEmail = async (to, subject, htmlContent) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                email: process.env.EMAIL_FROM || 'vidplay.dev@gmail.com',
                name: 'VidPlay'
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
    }

    return response.json();
};

/**
 * Send verification email with link to complete registration
 */
export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/register/${token}`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Welcome to VidPlay! 🎬</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Click the button below to verify your email and complete your registration.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #3b82f6; color: white; padding: 14px 28px; 
                          text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Complete Registration
                </a>
            </div>
            <p style="color: #999; font-size: 14px;">
                This link will expire in 24 hours. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
                © VidPlay. All rights reserved.
            </p>
        </div>
    `;

    try {
        return await sendBrevoEmail(email, 'Verify your email - VidPlay', htmlContent);
    } catch (error) {
        console.error('Email Error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetOTP = async (email, otp) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Password Reset Request 🔐</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Use the following OTP to reset your password. This code is valid for 10 minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
                        ${otp}
                    </span>
                </div>
            </div>
            <p style="color: #999; font-size: 14px;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
                © VidPlay. All rights reserved.
            </p>
        </div>
    `;

    try {
        return await sendBrevoEmail(email, 'Password Reset OTP - VidPlay', htmlContent);
    } catch (error) {
        console.error('Email Error:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a secure random token for email verification
 */
export const generateToken = () => {
    return crypto.randomUUID();
};
