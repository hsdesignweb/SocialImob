-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  format TEXT,
  why_it_works TEXT,
  hooks TEXT,
  scenes TEXT,
  caption TEXT,
  cta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_scripts table for tracking progress
CREATE TABLE IF NOT EXISTS user_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, script_id)
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scripts ENABLE ROW LEVEL SECURITY;

-- Policies for scripts (everyone can read, only admin can write)
CREATE POLICY "Scripts are viewable by everyone" ON scripts FOR SELECT USING (true);
CREATE POLICY "Scripts are insertable by admin" ON scripts FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Scripts are updatable by admin" ON scripts FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Scripts are deletable by admin" ON scripts FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies for user_scripts (users can only see and edit their own)
CREATE POLICY "Users can view their own script progress" ON user_scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own script progress" ON user_scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own script progress" ON user_scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own script progress" ON user_scripts FOR DELETE USING (auth.uid() = user_id);
