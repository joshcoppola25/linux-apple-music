const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!teamId || !keyId || !PRIVATE_KEY_PATH) {
    console.error("No values found in .env");
    process.exit(1);
}

const teamId = process.env.APPLE_TEAM_ID;
const keyId = process.env.APPLE_KEY_ID;
const PRIVATE_KEY_PATH = process.env.APPLE_PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

console.log("Team ID:", teamId);
console.log("Key ID:", keyId);

// Generate the token
const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '30d',
    issuer: teamId,
    header: {
        alg: 'ES256',
        kid: keyId,
    },
});

console.log(token);