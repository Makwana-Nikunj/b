import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { PendingEmail } from "../models/pendingEmail.model.js";
import { Token } from "../models/token.model.js";
import {
    sendVerificationEmail,
    sendPasswordResetOTP,
    generateOTP,
    generateToken
} from "../utils/email.util.js";

/**
 * Step 1: Initiate registration by sending verification email
 */
const initiateRegister = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(409, "Email is already registered");
    }

    // Check if there's already a pending verification for this email
    let pendingEmail = await PendingEmail.findOne({ email: email.toLowerCase() });

    if (pendingEmail) {
        // Update existing pending email with new token
        pendingEmail.token = generateToken();
        pendingEmail.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await pendingEmail.save();
    } else {
        // Create new pending email
        pendingEmail = await PendingEmail.create({
            email: email.toLowerCase(),
            token: generateToken()
        });
    }

    // Send verification email
    await sendVerificationEmail(pendingEmail.email, pendingEmail.token);

    return res.status(200).json(
        new ApiResponse(200, null, "Verification email sent. Please check your inbox.")
    );
});

/**
 * Verify email token and return email for registration form
 */
const verifyEmailToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const pendingEmail = await PendingEmail.findOne({ token });

    if (!pendingEmail) {
        throw new ApiError(400, "Invalid or expired verification link");
    }

    // Return the email so frontend can display it
    return res.status(200).json(
        new ApiResponse(200, { email: pendingEmail.email }, "Email verified. Please complete registration.")
    );
});

/**
 * Request password reset OTP
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json(
            new ApiResponse(200, null, "If this email exists, you will receive a password reset OTP.")
        );
    }

    // Check if user is OAuth-only (no password)
    if (user.authProvider !== 'local') {
        throw new ApiError(400, `This account uses ${user.authProvider} login. Please use that to sign in.`);
    }

    // Delete any existing OTP for this user
    await Token.deleteMany({ userId: user._id });

    // Generate and save new OTP
    const otp = generateOTP();
    await Token.create({
        userId: user._id,
        otp
    });

    // Send OTP email
    await sendPasswordResetOTP(user.email, otp);

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset OTP sent to your email.")
    );
});

/**
 * Verify OTP is valid (optional step - can be combined with reset)
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email?.trim() || !otp?.trim()) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(400, "Invalid email or OTP");
    }

    const token = await Token.findOne({ userId: user._id, otp });
    if (!token) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "OTP verified successfully")
    );
});

/**
 * Reset password with valid OTP
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(400, "Invalid email or OTP");
    }

    const token = await Token.findOne({ userId: user._id, otp });
    if (!token) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete the used OTP
    await Token.deleteOne({ _id: token._id });

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully. Please login with your new password.")
    );
});

export {
    initiateRegister,
    verifyEmailToken,
    forgotPassword,
    verifyOTP,
    resetPassword
};
