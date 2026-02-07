import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { verifyOAuthToken } from '../utils/oauth.util.js';

/**
 * Generate access and refresh tokens for a user
 */
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

/**
 * Generate unique username from name/email
 */
const generateUsername = (name, email) => {
    // Try to create username from name, fallback to email prefix
    const base = name
        ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        : email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}_${suffix}`;
};

/**
 * OAuth Login/Register - Unified endpoint for all OAuth providers (PKCE flow)
 * POST /api/v1/users/oauth
 */
export const oauthLogin = asyncHandler(async (req, res) => {
    const { code, codeVerifier, redirectUri, provider } = req.body;

    if (!code || !codeVerifier || !redirectUri || !provider) {
        throw new ApiError(400, 'Code, codeVerifier, redirectUri, and provider are required');
    }

    // 1. Exchange authorization code for user info (tokens handled server-side)
    const oauthUser = await verifyOAuthToken({ code, codeVerifier, redirectUri }, provider);
    const { providerId, email, name, picture } = oauthUser;

    // 2. Find existing user by (providerId + authProvider) or email
    let user = await User.findOne({
        $or: [
            { providerId: providerId, authProvider: provider },
            { email: email.toLowerCase() }
        ]
    });

    if (user) {
        // User exists - link OAuth if not already linked (local user logging in with OAuth)
        if (user.authProvider === 'local') {
            user.providerId = providerId;
            user.authProvider = provider;
            // Update avatar if user doesn't have one
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            await user.save({ validateBeforeSave: false });
        }
    } else {
        // Create new user
        const username = generateUsername(name, email);

        user = await User.create({
            providerId: providerId,
            authProvider: provider,
            username,
            email: email.toLowerCase(),
            fullName: name || email.split('@')[0],
            avatar: picture || '',
        });
    }

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 5. Get user without sensitive fields
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    // 6. Set cookies and respond
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'OAuth login successful'
            )
        );
});
