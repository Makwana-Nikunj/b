/**
 * Social Auth Utility - Unified function for all OAuth providers
 * Currently supports: Google (using popup flow for cleaner UX)
 * Extensible for: Facebook, Microsoft
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Load Google Identity Services script
 */
const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts) {
            resolve(window.google);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
    });
};

/**
 * Initialize Google login using popup flow (cleaner, fewer console errors)
 * @returns {Promise<string>} Google ID token
 */
const initGoogleLogin = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await loadGoogleScript();

            // Use OAuth2 code flow with popup - cleaner than One Tap
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile openid',
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        reject(new Error(tokenResponse.error_description || 'Google login failed'));
                        return;
                    }

                    try {
                        // Get user info using the access token
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: {
                                Authorization: `Bearer ${tokenResponse.access_token}`,
                            },
                        });

                        if (!userInfoResponse.ok) {
                            throw new Error('Failed to get user info');
                        }

                        const userInfo = await userInfoResponse.json();

                        // Return user info as our "token" - backend will handle differently
                        resolve(JSON.stringify({
                            access_token: tokenResponse.access_token,
                            ...userInfo,
                        }));
                    } catch (error) {
                        reject(error);
                    }
                },
            });

            // Request the token (opens popup)
            client.requestAccessToken();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Initiate social login for any provider
 * @param {string} provider - 'google' | 'facebook' | 'microsoft'
 * @returns {Promise<string>} OAuth token/credential
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
