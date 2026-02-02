-- SoulLink Supabase Schema

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  phone TEXT UNIQUE,
  gender TEXT,
  pronouns TEXT,
  location TEXT,
  bio TEXT,
  interests TEXT[],
  profile_photos TEXT[],
  mode_default TEXT CHECK (mode_default IN ('love', 'friends')) DEFAULT 'love',
  mode_locked BOOLEAN DEFAULT FALSE,
  wallet_address TEXT,
  private_mode BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT CHECK (mode IN ('love', 'friends')) NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chat Participants (Junction Table)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id UUID REFERENCES public.chats ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  PRIMARY KEY (chat_id, user_id)
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video', 'system')) DEFAULT 'text',
  encrypted BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('photo', 'video')) NOT NULL,
  title TEXT NOT NULL,
  tags TEXT[],
  visibility TEXT CHECK (visibility IN ('private', 'shared', 'public')) DEFAULT 'private',
  encrypted BOOLEAN DEFAULT FALSE,
  encrypted_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL, -- Renamed from start_date to match model
  type TEXT NOT NULL, -- matches model 'type'
  recurring TEXT, -- 'daily', 'weekly', etc.
  participants UUID[], -- Array of profile IDs
  reminder JSONB DEFAULT '{"enabled": false, "minutesBefore": 60}',
  daily_entries JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  mode TEXT CHECK (mode IN ('love', 'friends')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- [{text, emoji, score}]
  order_index INT DEFAULT 0
);

-- 9. Personality Quizzes
CREATE TABLE IF NOT EXISTS public.personality_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  mode TEXT CHECK (mode IN ('love', 'friends')) NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  answers JSONB NOT NULL,
  total_score INT DEFAULT 0,
  personality_type TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Game Results
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  score INT DEFAULT 0,
  answers JSONB,
  participant_id UUID REFERENCES public.profiles ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Love Letters
CREATE TABLE IF NOT EXISTS public.love_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  keywords TEXT[],
  mode TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Mood Entries
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.profiles ON DELETE SET NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Surprise Drops
CREATE TABLE IF NOT EXISTS public.surprise_drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  countdown_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Secret Gifts
CREATE TABLE IF NOT EXISTS public.secret_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  clues TEXT[],
  trivia_questions JSONB,
  max_attempts INT DEFAULT 3,
  attempts INT DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Verifications
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  result TEXT NOT NULL,
  proof_hash TEXT,
  on_chain_tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Consent Records
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consent_hash TEXT,
  granted BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  on_chain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Burn Messages
CREATE TABLE IF NOT EXISTS public.burn_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  auto_delete_after INT DEFAULT 60,
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Rules (Additional)
CREATE POLICY "Users can view their own memories" ON public.memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own personality quizzes" ON public.personality_quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view quizzes shared with them" ON public.personality_quizzes
  FOR SELECT USING (auth.uid() = ANY(shared_with) OR share_code IS NOT NULL);

CREATE POLICY "Users can view letters they sent or received" ON public.love_letters
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can view their own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can view their own verifications" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own consents" ON public.consent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view burn messages they sent or received" ON public.burn_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
