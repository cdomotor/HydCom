// scripts/stamp-app-name.js
// Update the Expo app name with the PR title and a timestamp.
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath));

// Get the PR title from environment or fallback
const rawTitle = process.env.PR_TITLE || 'NoTitle';

// Remove special characters except spaces and hyphens, then truncate
const sanitized = rawTitle.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
const shortTitle = sanitized.substring(0, 20) || 'NoTitle';

// Timestamp in HH:mm DD-MM-YY
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}`;

const newName = `hydcom-${shortTitle}-${timestamp}`;
appJson.expo.name = newName;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`✔ App name updated to: "${newName}"`);
