import { ApiError } from './ApiError.js';

/**
 * Verify OAuth token for any provider
 * @param {string} token - OAuth token/data from frontend
 * @param {string} provider - 'google' | 'facebook' | 'microsoft'
 * @returns {Object} { providerId, email, name, picture }
 */
export const verifyOAuthToken = async (token, provider) => {
    const verifiers = {
        google: verifyGoogleToken,
        // facebook: verifyFacebookToken,  // Add later
        // microsoft: verifyMicrosoftToken,  // Add later
    };

    if (!verifiers[provider]) {
        throw new ApiError(400, `Unsupported OAuth provider: ${provider}`);
    }

    return verifiers[provider](token);
};

/**
 * Verify Google OAuth token
 * Handles both ID tokens and access tokens with user info
 * @param {string} tokenData - JSON string with access_token and user info, or raw ID token
 * @returns {Object} { providerId, email, name, picture }
 */
const verifyGoogleToken = async (tokenData) => {
    try {
        // Parse the token data from frontend
        let userData;

        try {
            userData = JSON.parse(tokenData);
        } catch {
            // If not JSON, might be a raw ID token (legacy support)
            throw new ApiError(400, 'Invalid token format');
        }

        const { access_token, sub, email, name, picture, email_verified } = userData;

        if (!access_token || !email) {
            throw new ApiError(400, 'Missing required token data');
        }

        // Verify the access token is valid by calling Google's tokeninfo endpoint
        const verifyResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`
        );

        if (!verifyResponse.ok) {
            throw new ApiError(401, 'Invalid Google access token');
        }

        const tokenInfo = await verifyResponse.json();

        // Verify the token was issued for our client
        if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            // Check if it's in the allowed audiences (Google sometimes uses different format)
            if (!tokenInfo.azp || tokenInfo.azp !== process.env.GOOGLE_CLIENT_ID) {
                throw new ApiError(401, 'Token was not issued for this application');
            }
        }

        // Verify email matches
        if (tokenInfo.email !== email) {
            throw new ApiError(401, 'Email mismatch in token verification');
        }

        return {
            providerId: sub,
            email: email,
            name: name || email.split('@')[0],
            picture: picture || '',
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error('Google token verification error:', error);
        throw new ApiError(401, 'Invalid Google token');
    }
};
