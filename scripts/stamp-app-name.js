// scripts/stamp-app-name.js
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = require(appJsonPath);

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

appJson.expo.name = `HydroComp ${timestamp}`;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`✔ App name updated to: "${appJson.expo.name}"`);
