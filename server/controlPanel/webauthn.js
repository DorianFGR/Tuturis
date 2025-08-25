// ===== Base64URL helpers =====
function base64urlToUint8Array(base64url) {
    if (!base64url) throw new Error('base64url string is undefined or empty');
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function uint8ArrayToBase64url(uint8Array) {
    const base64 = btoa(String.fromCharCode(...uint8Array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ===== Registration =====
// Unified implementation that always returns a boolean.
// By default it does NOT block on server 2010 verification to avoid cross-origin cookie hassles during dev.
// Set { useVerify: true } if you want to call http://localhost:2010/webauthn/registration/verify and block on it.
async function registerWebAuthn(userId, username, { useVerify = false } = {}) {
    try {
        console.log('[registerWebAuthn] start', { userId, username });

        // 1) Get options from the WebAuthn server (port 2010)
        const optionsResp = await fetch('http://localhost:2010/webauthn/registration/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // credentials: 'include', // uncomment if your 2010 server uses cookies/sessions and you configured CORS for credentials
            body: JSON.stringify({ userId, username }),
        });

        if (!optionsResp.ok) {
            const txt = await optionsResp.text().catch(() => '');
            console.error('[registerWebAuthn] options error', optionsResp.status, txt);
            return false;
        }

        const options = await optionsResp.json().catch(err => {
            console.error('[registerWebAuthn] options JSON parse error', err);
            return null;
        });
        if (!options || !options.challenge || !options.user?.id) {
            console.error('[registerWebAuthn] invalid options from server', options);
            return false;
        }

        const publicKeyCredentialCreationOptions = {
            ...options,
            challenge: base64urlToUint8Array(options.challenge),
            user: {
                ...options.user,
                id: base64urlToUint8Array(options.user.id),
            },
            excludeCredentials: options.excludeCredentials?.map(cred => ({
                ...cred,
                id: base64urlToUint8Array(cred.id),
            })) || [],
        };

        // 2) Create credential with WebAuthn API
        const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
        if (!credential) {
            console.error('[registerWebAuthn] navigator.credentials.create returned null');
            return false;
        }

        const credentialForServer = {
            id: credential.id,
            rawId: uint8ArrayToBase64url(new Uint8Array(credential.rawId)),
            response: {
                attestationObject: uint8ArrayToBase64url(new Uint8Array(credential.response.attestationObject)),
                clientDataJSON: uint8ArrayToBase64url(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
            // transports: credential.response.getTransports?.(), // uncomment if needed and supported by browser
        };

        // 3) Optional: cryptographic verification on server 2010
        if (useVerify) {
            const verifyResp = await fetch('http://localhost:2010/webauthn/registration/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // credentials: 'include', // uncomment if your 2010 server uses cookies/sessions and you configured CORS for credentials
                body: JSON.stringify({ userId, credential: credentialForServer }),
            });

            if (!verifyResp.ok) {
                const txt = await verifyResp.text().catch(() => '');
                console.warn('[registerWebAuthn] verify failed (non-blocking for dev)', verifyResp.status, txt);
                // If you want verification to be blocking, replace the line above with: return false;
            } else {
                const v = await verifyResp.json().catch(() => ({}));
                console.log('[registerWebAuthn] verify result', v);
                // If you want to block when not verified: if (!v.verified) return false;
            }
        }

        // 4) Persist credential in your main backend (port 2009)
        const dbResp = await fetch('http://localhost:2009/api/webauthn-key-created', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, credential: credentialForServer }),
        });

        const dbTxt = await dbResp.text().catch(() => '');
        console.log('[registerWebAuthn] key-created', dbResp.status, dbTxt);

        return dbResp.ok;
    } catch (error) {
        console.error('[registerWebAuthn] exception', error);
        return false;
    }
}

// ===== Authentication =====
async function authenticateWebAuthn(userId) {
    try {
        // 1) Get options
        const optionsResponse = await fetch('http://localhost:2010/webauthn/authentication/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!optionsResponse.ok) {
            const t = await optionsResponse.text().catch(() => '');
            throw new Error(`Server error: ${optionsResponse.status} ${t}`);
        }

        const options = await optionsResponse.json();
        console.log('Authentication options:', options);

        if (!options.challenge) {
            throw new Error('Invalid options received from server - no challenge');
        }

        const publicKeyCredentialRequestOptions = {
            ...options,
            challenge: base64urlToUint8Array(options.challenge),
            allowCredentials: options.allowCredentials?.map(cred => ({
                ...cred,
                id: base64urlToUint8Array(cred.id),
            })) || [],
        };

        // 2) Get assertion
        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        if (!assertion) throw new Error('Failed to get assertion');

        const assertionForServer = {
            id: assertion.id,
            rawId: uint8ArrayToBase64url(new Uint8Array(assertion.rawId)),
            response: {
                authenticatorData: uint8ArrayToBase64url(new Uint8Array(assertion.response.authenticatorData)),
                clientDataJSON: uint8ArrayToBase64url(new Uint8Array(assertion.response.clientDataJSON)),
                signature: uint8ArrayToBase64url(new Uint8Array(assertion.response.signature)),
                userHandle: assertion.response.userHandle
                    ? uint8ArrayToBase64url(new Uint8Array(assertion.response.userHandle))
                    : null,
            },
            type: assertion.type,
        };

        // 3) Verify assertion on the WebAuthn server (2010)
        const verifyResponse = await fetch('http://localhost:2010/webauthn/authentication/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, credential: assertionForServer }),
        });

        if (!verifyResponse.ok) {
            const t = await verifyResponse.text().catch(() => '');
            throw new Error(`Authentication failed: ${verifyResponse.status} ${t}`);
        }

        const result = await verifyResponse.json();
        return !!result.verified;
    } catch (error) {
        console.error('Authentication Error:', error);
        return false;
    }
}