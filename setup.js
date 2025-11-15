#!/usr/bin/env node

/**
 * Auto-install script for Loves Platform
 * Run: node setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Loves Platform...\n');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`Running: ${command}`, 'blue');
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Step 1: Install root dependencies
log('\n📦 Step 1: Installing root dependencies...', 'yellow');
if (!fs.existsSync('node_modules')) {
  runCommand('npm install');
} else {
  log('✓ Root dependencies already installed', 'green');
}

// Step 2: Install frontend dependencies
log('\n📦 Step 2: Installing frontend dependencies...', 'yellow');
if (!fs.existsSync('frontend/node_modules')) {
  runCommand('npm install', 'frontend');
} else {
  log('✓ Frontend dependencies already installed', 'green');
}

// Step 3: Install backend dependencies
log('\n📦 Step 3: Installing backend dependencies...', 'yellow');
if (!fs.existsSync('backend/node_modules')) {
  runCommand('npm install', 'backend');
} else {
  log('✓ Backend dependencies already installed', 'green');
}

// Step 4: Create environment files
log('\n📝 Step 4: Setting up environment files...', 'yellow');

// Backend .env
if (!fs.existsSync('backend/.env')) {
  const backendEnv = `# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/loves

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Optional Services (leave empty for development)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@loves.com

OPENAI_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

PRIVATE_KEY=
RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=

ENCRYPTION_KEY=your-32-byte-encryption-key-base64
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
  fs.writeFileSync('backend/.env', backendEnv);
  log('✓ Created backend/.env', 'green');
} else {
  log('✓ backend/.env already exists', 'green');
}

// Frontend .env.local
if (!fs.existsSync('frontend/.env.local')) {
  const frontendEnv = `NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_CONTRACT_ADDRESS=
`;
  fs.writeFileSync('frontend/.env.local', frontendEnv);
  log('✓ Created frontend/.env.local', 'green');
} else {
  log('✓ frontend/.env.local already exists', 'green');
}

// Step 5: Create uploads directories
log('\n📁 Step 5: Creating upload directories...', 'yellow');
const uploadDirs = [
  'backend/uploads/memories',
  'backend/uploads/photobooth',
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✓ Created ${dir}`, 'green');
  } else {
    log(`✓ ${dir} already exists`, 'green');
  }
});

// Step 6: Build backend (optional)
log('\n🔨 Step 6: Building backend...', 'yellow');
try {
  runCommand('npm run build', 'backend');
  log('✓ Backend built successfully', 'green');
} catch (error) {
  log('⚠ Backend build skipped (will build on first run)', 'yellow');
}

log('\n✅ Setup complete!', 'green');
log('\n📋 Next steps:', 'blue');
log('1. Make sure MongoDB is running (or update MONGODB_URI in backend/.env)', 'blue');
log('2. Update environment variables in backend/.env and frontend/.env.local', 'blue');
log('3. Run: npm run dev', 'blue');
log('\n🚀 Your platform is ready to use!', 'green');

