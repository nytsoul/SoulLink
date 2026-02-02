import { createClient } from '@supabase/supabase-js';

console.log('[DIAGNOSTIC] supabaseClient.ts - Initializing...');

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

if (!isValidUrl(supabaseUrl) || !supabaseKey || supabaseUrl === 'your-supabase-url') {
    console.error('\n❌ ERROR: Supabase configuration is missing or invalid!');
    console.error('🔗 Please go to your Supabase project settings -> API and copy the Project URL and Service Role Key.');
    console.error('📝 Update your .env file with these values:\n');
    console.error('   SUPABASE_URL=https://your-project-ref.supabase.co');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');

    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

// Create client only if URL is valid to prevent crash
export const supabase = isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl!, supabaseKey || '')
    : (null as any); 
