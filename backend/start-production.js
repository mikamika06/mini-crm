#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Mini-CRM Backend Production...');

// Check if dist directory exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error('Error: dist directory not found. Please run npm run build first.');
  process.exit(1);
}

// Check if main.js exists
if (!fs.existsSync(path.join(__dirname, 'dist/main.js'))) {
  console.error('Error: dist/main.js not found. Please run npm run build first.');
  process.exit(1);
}

console.log('Starting application...');

// Start the application
const app = spawn('node', ['dist/main.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

app.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

app.on('error', (err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
