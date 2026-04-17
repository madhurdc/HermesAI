-- ============================================
-- Hermes AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  mode TEXT DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
  questions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  overall_score INTEGER,
  report JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interview Answers (individual Q&A pairs per session)
CREATE TABLE IF NOT EXISTS interview_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_index INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resume Reviews
CREATE TABLE IF NOT EXISTS resume_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  ats_score INTEGER,
  report JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Career Guidance Sessions
CREATE TABLE IF NOT EXISTS career_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]',
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- Users can only access their own data
-- ============================================

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_sessions ENABLE ROW LEVEL SECURITY;

-- Interview Sessions policies
CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Interview Answers policies (via session ownership)
CREATE POLICY "Users can view own interview answers"
  ON interview_answers FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interview answers"
  ON interview_answers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Resume Reviews policies
CREATE POLICY "Users can view own resume reviews"
  ON resume_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume reviews"
  ON resume_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Career Sessions policies
CREATE POLICY "Users can view own career sessions"
  ON career_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career sessions"
  ON career_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career sessions"
  ON career_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_user_id ON resume_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_career_sessions_user_id ON career_sessions(user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_sessions_updated_at
  BEFORE UPDATE ON career_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
