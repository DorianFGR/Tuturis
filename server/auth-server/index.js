const express = require('express');
const cors = require('cors');
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const app = express();
app.use(cors());
app.use(express.json());

const rpName = 'Tuturis WebAuthn Server';
const rpID = 'localhost';
const origin = 'http://localhost:2009';

const userCredentials = new Map();
const userChallenges = new Map();

app.get('/', (req, res) => {
    res.send('WebAuthn server is up !');
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.post('/webauthn/registration/options', async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        const { userId, username } = req.body;

        if (!userId || !username) {
            console.error('Missing userId or username');
            return res.status(400).json({ error: 'userId and username are required' });
        }

        userChallenges.delete(userId);

        console.log(`Generating options for user: ${userId}, username: ${username}`);

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: new TextEncoder().encode(userId),
            userName: username,
            userDisplayName: username,
            attestationType: 'none',
            excludeCredentials: [],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'preferred',
                requireResidentKey: false,
            },
            supportedAlgorithmIDs: [-7, -257],
            timeout: 60000,
        });

        console.log('Generated options:', options);
        userChallenges.set(userId, options.challenge);
        res.json(options);
    } catch (error) {
        console.error('Registration options error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/webauthn/registration/verify', async (req, res) => {
    try {
        const { userId, credential } = req.body;
        const expectedChallenge = userChallenges.get(userId);

        if (!expectedChallenge) {
            return res.status(400).json({ error: 'Challenge not found' });
        }

        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified) {
            if (!userCredentials.has(userId)) {
                userCredentials.set(userId, []);
            }
            userCredentials.get(userId).push(verification.registrationInfo);

            userChallenges.delete(userId);
            console.log('Registration verified for:', userId);
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error('Registration verify error:', error);
        res.status(500).json({ error: error.message });
    }
});
/*
app.post('/webauthn/authentication/options', async (req, res) => {
    try {
        console.log('Authentication options request received');
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        userChallenges.delete(userId);
        const userCreds = userCredentials.get(userId) || [];

        console.log(`Authentication request for userId: ${userId}`);
        console.log(`Found ${userCreds.length} credentials for user`);

        if (userCreds.length === 0) {
            return res.status(400).json({
                error: 'No credentials found for user. Please register a security key first.'
            });
        }

        // Debug: examiner la structure exacte des credentials
        console.log('Credential structure analysis:');
        userCreds.forEach((cred, index) => {
            console.log(`Credential ${index}:`, {
                keys: Object.keys(cred),
                hasCredentialID: 'credentialID' in cred,
                hasCredentialId: 'credentialId' in cred,
                credentialIDType: typeof cred.credentialID,
                credentialIdType: typeof cred.credentialId,
                isCredentialIDBuffer: Buffer.isBuffer(cred.credentialID),
                isCredentialIdBuffer: Buffer.isBuffer(cred.credentialId)
            });
        });

        const validCredentials = userCreds.filter(cred => {
            const credId = cred.credentialID || cred.credentialId;
            const isValid = cred && credId && Buffer.isBuffer(credId);
            console.log('Credential validation:', {
                exists: !!cred,
                hasCredentialID: !!credId,
                isBuffer: Buffer.isBuffer(credId),
                valid: isValid
            });
            return isValid;
        });

        console.log(`Found ${validCredentials.length} valid credentials out of ${userCreds.length}`);

        if (validCredentials.length === 0) {
            return res.status(400).json({
                error: 'No valid credentials found for user. Please register a new security key.'
            });
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: validCredentials.map(cred => ({
                id: cred.credentialID || cred.credentialId,
                type: 'public-key',
            })),
            userVerification: 'preferred',
            timeout: 60000,
        });

        userChallenges.set(userId, options.challenge);
        console.log('Generated authentication options successfully for:', userId);
        res.json(options);
    } catch (error) {
        console.error('Authentication options error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/webauthn/authentication/verify', async (req, res) => {
    try {
        const { userId, credential } = req.body;
        const expectedChallenge = userChallenges.get(userId);
        const userCreds = userCredentials.get(userId) || [];

        console.log('Authentication verify - userId:', userId);
        console.log('Authentication verify - credential ID:', credential.rawId);
        console.log('Authentication verify - user has', userCreds.length, 'credentials');

        if (!expectedChallenge) {
            console.log('No challenge found for user:', userId);
            return res.status(400).json({ error: 'Challenge not found' });
        }

        const credentialIdBuffer = Buffer.from(credential.rawId, 'base64url');

        const authenticator = userCreds.find(cred => {
            if (!cred || !cred.credentialID) {
                console.log('Invalid credential found');
                return false;
            }

            const credIdMatches = Buffer.isBuffer(cred.credentialID)
                ? cred.credentialID.equals(credentialIdBuffer)
                : Buffer.from(cred.credentialID).equals(credentialIdBuffer);

            console.log('Comparing credential IDs:', {
                stored: Buffer.isBuffer(cred.credentialID) ? cred.credentialID.toString('base64url') : cred.credentialID,
                received: credential.rawId,
                matches: credIdMatches
            });

            return credIdMatches;
        });

        if (!authenticator) {
            console.log('No matching authenticator found for credential ID:', credential.rawId);
            return res.status(400).json({ error: 'Authenticator not found' });
        }

        console.log('Found matching authenticator, proceeding with verification');

        const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter || 0,
            },
        });

        if (verification.verified) {
            authenticator.counter = verification.authenticationInfo.newCounter;
            userChallenges.delete(userId);
            console.log('Authentication verified successfully for:', userId);
            res.json({ verified: true });
        } else {
            console.log('Authentication verification failed');
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error('Authentication verify error:', error);
        res.status(500).json({ error: error.message });
    }
});*/

const PORT = process.env.PORT || 2010;
app.listen(PORT, () => {
    console.log(`Serveur WebAuthn sur http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log('- GET /health');
    console.log('- POST /webauthn/registration/options');
    console.log('- POST /webauthn/registration/verify');
    console.log('- POST /webauthn/authentication/options');
    console.log('- POST /webauthn/authentication/verify');
});