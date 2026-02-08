import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Get or create Nodemailer transporter (lazy initialization)
 */
const getTransporter = () => {
    if (!transporter) {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error('Gmail credentials not configured. Please add GMAIL_USER and GMAIL_APP_PASSWORD to your .env file.');
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
    return transporter;
};

/**
 * Send verification email with link to complete registration
 */
export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/register/${token}`;

    const mailOptions = {
        from: `"VidPlay" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify your email - VidPlay',
        html: `
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
        `
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetOTP = async (email, otp) => {
    const mailOptions = {
        from: `"VidPlay" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - VidPlay',
        html: `
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
        `
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        return info;
    } catch (error) {
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
