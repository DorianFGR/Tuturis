const express = require('express');
const cors = require('cors');
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/webauthn/register-challenge', (req, res) => {
    const options = generateRegistrationOptions({
        rpName: 'Tuturis',
        userID: req.body.userID,
        userName: req.body.userName,
    });
    res.json(options);
});

// Add other roots here
app.listen(3001, () => console.log('Auth server on http://localhost:3001'));