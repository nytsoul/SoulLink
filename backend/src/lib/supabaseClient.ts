import './env';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`[DIAGNOSTIC] CWD: ${process.cwd()}`);
console.log(`[DIAGNOSTIC] SUPABASE_URL: ${supabaseUrl ? (supabaseUrl.substring(0, 10) + '...') : 'undefined'}`);
console.log(`[DIAGNOSTIC] SUPABASE_KEY: ${supabaseKey ? 'exists' : 'undefined'}`);

const isValidUrl = (url: string | undefined) => {
    if (!url) return false;
    try {
        new URL(url);
        return url.startsWith('http');
    } catch (e) {
        return false;
    }
};

const isValidKey = (key: string | undefined) => !!key && (key.startsWith('eyJ') || key.startsWith('sb_secret_'));

if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseKey) || supabaseUrl === 'your-supabase-url') {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR: Supabase configuration is missing or invalid!');
    console.error('🔗 URL:', supabaseUrl || 'MISSING');
    console.error('🔑 KEY:', isValidKey(supabaseKey) ? 'Valid Format' : 'INVALID FORMAT (Must start with eyJ or sb_secret_)');
    console.error('\n👉 Please go to your Supabase project settings -> API and copy:');
    console.error('   1. The Project URL');
    console.error('   2. The "service_role" secret key');
    console.error('='.repeat(60) + '\n');

    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

// Create client only if URL and KEY are valid to prevent 401/400 errors from broken client
export const supabase = (isValidUrl(supabaseUrl) && isValidKey(supabaseKey))
    ? createClient(supabaseUrl!, supabaseKey!)
    : (null as any); 
