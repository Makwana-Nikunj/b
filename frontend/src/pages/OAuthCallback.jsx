/**
 * OAuth Callback Page
 * This page receives the authorization code from Google
 * and allows the popup to be read by the parent window
 */
function OAuthCallback() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Completing sign in...</p>
            </div>
        </div>
    )
}

export default OAuthCallback
