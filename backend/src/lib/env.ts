import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple possible locations for .env
const possiblePaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'backend', '.env'),
    path.join(__dirname, '../../.env'), // From src/lib/ to backend/
    path.join(__dirname, '../../../.env'), // From src/lib/ to root (if backend is a subdir)
];

let foundPath = '';
for (const p of possiblePaths) {
    if (foundPath === '' && fs.existsSync(p)) {
        foundPath = p;
    }
}

const result = foundPath ? dotenv.config({ path: foundPath }) : { error: new Error('No .env file found') };

if (result.error) {
    console.log('[ENV] ⚠️ Warning: .env file not found. Checked:');
    possiblePaths.forEach(p => console.log(`  - ${p}`));
} else {
    console.log('[ENV] ✅ Loaded from:', foundPath);
}
