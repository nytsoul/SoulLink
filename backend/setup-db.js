const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure DATABASE_URL is set
process.env.DATABASE_URL = 'file:./dev.db';

console.log('🔧 Setting up SQLite database with Prisma...\n');

try {
    // Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });

    // Push schema to database
    console.log('\n📊 Creating database schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: __dirname });

    console.log('\n✅ Database setup complete!');
    console.log('📁 Database file: ./dev.db');
} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}
