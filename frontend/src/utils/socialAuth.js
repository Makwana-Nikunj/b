/**
 * Social Auth Utility - Authorization Code + PKCE Flow
 * More secure: tokens are exchanged server-side, never exposed to frontend
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Generate a random string for PKCE code_verifier
 */
const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
};

/**
 * Generate code_challenge from code_verifier (SHA-256 hash)
 */
const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
};

/**
 * Base64 URL encode (required for PKCE)
 */
const base64UrlEncode = (buffer) => {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Generate a random state parameter to prevent CSRF
 */
const generateState = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
};

/**
 * Initialize Google login using Authorization Code + PKCE flow
 * @returns {Promise<{code: string, codeVerifier: string}>}
 */
const initGoogleLogin = async () => {
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store state and code_verifier for later verification
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);

    // Build Google OAuth URL
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/oauth/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state,
        access_type: 'offline',
        prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Open popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
        authUrl,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
    );

    // Wait for popup to return with authorization code
    return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    reject(new Error('Popup closed by user'));
                    return;
                }

                // Check if popup navigated to callback URL
                const popupUrl = popup.location.href;
                if (popupUrl.includes('/oauth/callback')) {
                    clearInterval(checkPopup);

                    const url = new URL(popupUrl);
                    const code = url.searchParams.get('code');
                    const returnedState = url.searchParams.get('state');
                    const error = url.searchParams.get('error');

                    popup.close();

                    if (error) {
                        reject(new Error(error));
                        return;
                    }

                    // Verify state to prevent CSRF
                    const savedState = sessionStorage.getItem('oauth_state');
                    if (returnedState !== savedState) {
                        reject(new Error('State mismatch - possible CSRF attack'));
                        return;
                    }

                    // Get code_verifier for backend
                    const savedVerifier = sessionStorage.getItem('oauth_code_verifier');

                    // Clean up
                    sessionStorage.removeItem('oauth_state');
                    sessionStorage.removeItem('oauth_code_verifier');

                    resolve({
                        code,
                        codeVerifier: savedVerifier,
                        redirectUri: `${window.location.origin}/oauth/callback`,
                    });
                }
            } catch (e) {
                // Cross-origin error - popup is still on Google's domain
                // This is expected, continue checking
            }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
            clearInterval(checkPopup);
            if (!popup.closed) popup.close();
            reject(new Error('OAuth timeout'));
        }, 5 * 60 * 1000);
    });
};

/**
 * Initiate social login for any provider using PKCE
 * @param {string} provider - 'google' | 'facebook' | 'microsoft'
 * @returns {Promise<{code: string, codeVerifier: string, redirectUri: string}>}
 */
export const initSocialLogin = async (provider) => {
    const handlers = {
        google: initGoogleLogin,
        // facebook: initFacebookLogin,  // Add later
        // microsoft: initMicrosoftLogin,  // Add later
    };

    if (!handlers[provider]) {
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return handlers[provider]();
};

export default initSocialLogin;
