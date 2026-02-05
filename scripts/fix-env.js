const fs = require('fs');
const sa = JSON.parse(fs.readFileSync('c:/Users/BENJI/Downloads/estrumetalonline-firebase-adminsdk-fbsvc-19ea620739.json', 'utf8'));
const envPath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/estrumetal-app/.env.local';
let env = fs.readFileSync(envPath, 'utf8');

// Replace the private key line
const escapedKey = sa.private_key.replace(/\n/g, '\\n');
env = env.replace(/FIREBASE_PRIVATE_KEY=\".*\"/, `FIREBASE_PRIVATE_KEY="${escapedKey}"`);

fs.writeFileSync(envPath, env);
console.log('Updated .env.local successfully');
