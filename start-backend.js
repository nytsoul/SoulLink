#!/usr/bin/env node

/**
 * Quick start script for backend server
 * Run: node start-backend.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...\n');

// Check if MongoDB is running (optional check)
const checkMongo = spawn('mongosh', ['--eval', 'db.version()'], {
  stdio: 'ignore',
  shell: true,
});

checkMongo.on('error', () => {
  console.warn('⚠️  Warning: MongoDB might not be running.');
  console.warn('   Make sure MongoDB is installed and running on mongodb://localhost:27017');
  console.warn('   Or update MONGODB_URI in backend/.env\n');
});

checkMongo.on('exit', () => {
  // Start the backend
  const backend = spawn('npm', ['run', 'dev:backend'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  backend.on('error', (err) => {
    console.error('❌ Failed to start backend:', err);
    console.error('\n💡 Make sure you have run: npm install');
    process.exit(1);
  });

  backend.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Backend exited with code ${code}`);
    }
  });
});

