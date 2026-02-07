import { ApiError } from './ApiError.js';

/**
 * Verify OAuth authorization code for any provider using PKCE
 * Exchanges code for tokens server-side (tokens never touch frontend)
 * @param {Object} data - { code, codeVerifier, redirectUri, provider }
 * @returns {Object} { providerId, email, name, picture }
 */
export const verifyOAuthToken = async (data, provider) => {
    const verifiers = {
        google: verifyGoogleCode,
        // facebook: verifyFacebookCode,  // Add later
        // microsoft: verifyMicrosoftCode,  // Add later
    };

    if (!verifiers[provider]) {
        throw new ApiError(400, `Unsupported OAuth provider: ${provider}`);
    }

    return verifiers[provider](data);
};

/**
 * Exchange Google authorization code for tokens (PKCE flow)
 * Tokens are exchanged server-side - never exposed to frontend
 * @param {Object} data - { code, codeVerifier, redirectUri }
 * @returns {Object} { providerId, email, name, picture }
 */
const verifyGoogleCode = async (data) => {
    try {
        const { code, codeVerifier, redirectUri } = data;

        if (!code || !codeVerifier || !redirectUri) {
            throw new ApiError(400, 'Missing required OAuth parameters');
        }

        // Exchange authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code: code,
                code_verifier: codeVerifier,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error('Google token exchange error:', error);
            throw new ApiError(401, 'Failed to exchange authorization code');
        }

        const tokens = await tokenResponse.json();
        const { access_token, id_token } = tokens;

        // Verify ID token and get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            throw new ApiError(401, 'Failed to get user info from Google');
        }

        const userInfo = await userInfoResponse.json();

        // Verify email is verified
        if (!userInfo.email_verified) {
            throw new ApiError(400, 'Google email not verified');
        }

        return {
            providerId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            picture: userInfo.picture || '',
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error('Google OAuth error:', error);
        throw new ApiError(401, 'Google authentication failed');
    }
};
