#!/usr/bin/env node

/**
 * Generate secure secrets for deployment
 * Run: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for deployment...\n');

const jwtSecret = crypto.randomBytes(32).toString('base64');
const jwtRefreshSecret = crypto.randomBytes(32).toString('base64');
const encryptionKey = crypto.randomBytes(32).toString('base64');

console.log('Copy these to your Render environment variables:\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);
console.log('ENCRYPTION_KEY=' + encryptionKey);
console.log('\n✅ Secrets generated! Keep these secure and never commit them to git.');


