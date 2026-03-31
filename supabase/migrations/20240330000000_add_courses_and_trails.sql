-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add course_id to modules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE modules ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create Trails (Jornadas) table
CREATE TABLE IF NOT EXISTS trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Trail Lessons (Playlist items)
CREATE TABLE IF NOT EXISTS trail_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(trail_id, lesson_id)
);

-- Create User Lesson Progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies for courses
DROP POLICY IF EXISTS "Courses are viewable by everyone." ON courses;
CREATE POLICY "Courses are viewable by everyone." ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Courses are insertable by admins." ON courses;
CREATE POLICY "Courses are insertable by admins." ON courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Courses are updatable by admins." ON courses;
CREATE POLICY "Courses are updatable by admins." ON courses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Courses are deletable by admins." ON courses;
CREATE POLICY "Courses are deletable by admins." ON courses FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policies for trails
DROP POLICY IF EXISTS "Trails are viewable by everyone." ON trails;
CREATE POLICY "Trails are viewable by everyone." ON trails FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trails are insertable by admins." ON trails;
CREATE POLICY "Trails are insertable by admins." ON trails FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Trails are updatable by admins." ON trails;
CREATE POLICY "Trails are updatable by admins." ON trails FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Trails are deletable by admins." ON trails;
CREATE POLICY "Trails are deletable by admins." ON trails FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policies for trail_lessons
DROP POLICY IF EXISTS "Trail lessons are viewable by everyone." ON trail_lessons;
CREATE POLICY "Trail lessons are viewable by everyone." ON trail_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trail lessons are insertable by admins." ON trail_lessons;
CREATE POLICY "Trail lessons are insertable by admins." ON trail_lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Trail lessons are updatable by admins." ON trail_lessons;
CREATE POLICY "Trail lessons are updatable by admins." ON trail_lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Trail lessons are deletable by admins." ON trail_lessons;
CREATE POLICY "Trail lessons are deletable by admins." ON trail_lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policies for user_lesson_progress
DROP POLICY IF EXISTS "Users can view their own progress." ON user_lesson_progress;
CREATE POLICY "Users can view their own progress." ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress." ON user_lesson_progress;
CREATE POLICY "Users can insert their own progress." ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress." ON user_lesson_progress;
CREATE POLICY "Users can update their own progress." ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own progress." ON user_lesson_progress;
CREATE POLICY "Users can delete their own progress." ON user_lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- Insert a default course for existing modules to prevent breaking
INSERT INTO courses (title, description) 
SELECT 'Curso Principal', 'Curso padrão'
WHERE NOT EXISTS (SELECT 1 FROM courses);

-- Assign existing modules to the default course
UPDATE modules 
SET course_id = (SELECT id FROM courses LIMIT 1)
WHERE course_id IS NULL;
