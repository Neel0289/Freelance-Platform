const FIREBASE_ERROR_MESSAGES = {
    'firebase/missing-config':
        'Google sign-in is not configured. Set all VITE_FIREBASE_* variables and restart the frontend server.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled before completion.',
    'auth/popup-blocked': 'Popup was blocked by the browser. Allow popups and try again.',
    'auth/unauthorized-domain':
        'This domain is not authorized in Firebase Auth. Add it under Firebase Authentication -> Authorized domains.',
    'auth/operation-not-allowed':
        'Google sign-in is not enabled in Firebase Authentication -> Sign-in method.',
    'auth/invalid-api-key': 'Firebase API key is invalid. Check VITE_FIREBASE_API_KEY.',
    'auth/network-request-failed': 'Network error while contacting Google. Check your internet connection.',
};

export function getGoogleAuthErrorMessage(error) {
    const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0];

    if (backendError) {
        return backendError;
    }

    if (error?.code && FIREBASE_ERROR_MESSAGES[error.code]) {
        return FIREBASE_ERROR_MESSAGES[error.code];
    }

    if (error?.message) {
        return error.message;
    }

    return 'Google login failed';
}
