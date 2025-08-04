async function registerWebAuthn(userId, username) {
    try {
        console.log('Sending registration request with:', { userId, username });

        const optionsResponse = await fetch('http://localhost:2010/webauthn/registration/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username })
        });

        console.log('Response status:', optionsResponse.status);

        if (!optionsResponse.ok) {
            const errorText = await optionsResponse.text();
            throw new Error(`Server error: ${optionsResponse.status} - ${errorText}`);
        }

        const responseText = await optionsResponse.text();
        console.log('Raw response:', responseText);

        const options = JSON.parse(responseText);
        console.log('Registration options:', options);

        if (!options.challenge) {
            throw new Error('Invalid options received from server - no challenge');
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

        const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        });

        if (!credential) {
            throw new Error('Failed to create credential');
        }

        const credentialForServer = {
            id: credential.id,
            rawId: uint8ArrayToBase64url(new Uint8Array(credential.rawId)),
            response: {
                attestationObject: uint8ArrayToBase64url(new Uint8Array(credential.response.attestationObject)),
                clientDataJSON: uint8ArrayToBase64url(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
        };

        const verifyResponse = await fetch('http://localhost:2010/webauthn/registration/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                credential: credentialForServer
            })
        });

        if (!verifyResponse.ok) {
            throw new Error(`Verification failed: ${verifyResponse.status}`);
        }

        const result = await verifyResponse.json();

        if (result.verified) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return result.verified;

    } catch (error) {
        console.error('Registration Error:', error);
        return false;
    }
}

async function authenticateWebAuthn(userId) {
    try {
        const optionsResponse = await fetch('http://localhost:2010/webauthn/authentication/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!optionsResponse.ok) {
            throw new Error(`Server error: ${optionsResponse.status}`);
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

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        if (!assertion) {
            throw new Error('Failed to get assertion');
        }

        const assertionForServer = {
            id: assertion.id,
            rawId: uint8ArrayToBase64url(new Uint8Array(assertion.rawId)),
            response: {
                authenticatorData: uint8ArrayToBase64url(new Uint8Array(assertion.response.authenticatorData)),
                clientDataJSON: uint8ArrayToBase64url(new Uint8Array(assertion.response.clientDataJSON)),
                signature: uint8ArrayToBase64url(new Uint8Array(assertion.response.signature)),
                userHandle: assertion.response.userHandle ? uint8ArrayToBase64url(new Uint8Array(assertion.response.userHandle)) : null,
            },
            type: assertion.type,
        };

        const verifyResponse = await fetch('http://localhost:2010/webauthn/authentication/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                credential: assertionForServer
            })
        });

        if (!verifyResponse.ok) {
            throw new Error(`Authentication failed: ${verifyResponse.status}`);
        }

        const result = await verifyResponse.json();
        return result.verified;

    } catch (error) {
        console.error('Authentication Error:', error);
        return false;
    }
}

function base64urlToUint8Array(base64url) {
    if (!base64url) {
        throw new Error('base64url string is undefined or empty');
    }
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64url(uint8Array) {
    const base64 = btoa(String.fromCharCode(...uint8Array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}