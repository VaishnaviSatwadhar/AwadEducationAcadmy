/*
# Awad Educational Academy - Initial Database Schema

This migration creates the core database schema for a production-ready educational platform similar to Coursera/Udemy.

## 1. New Tables
- `profiles` - User profiles extending auth.users with role (student/instructor/admin)
- `categories` - Course categories (Programming, Design, Business, etc.)
- `courses` - Course listings with instructor, pricing, content
- `lessons` - Individual lessons within courses (video, text, quiz types)
- `enrollments` - Student course enrollments with progress tracking
- `lesson_progress` - Progress tracking for each lesson
- `reviews` - Course reviews and ratings
- `wishlist` - Student wishlisted courses
- `quizzes` - Quiz definitions for lessons
- `quiz_questions` - Questions within quizzes
- `quiz_answers` - Student quiz submissions
- `certificates` - Course completion certificates
- `coupons` - Discount codes
- `orders` - Payment/checkout records
- `notifications` - User notifications

## 2. Security
- Row Level Security enabled on ALL tables
- Owner-scoped policies for user data (profiles, enrollments, wishlist, etc.)
- Instructor ownership for courses/lessons
- Admin full access through service role
- Public read for courses, categories (catalog browsing)
- Authenticated write for enrollments, reviews, progress

## 3. Important Notes
- All user ID columns use DEFAULT auth.uid() for automatic assignment
- CASCADE delete for parent-child relationships
- Indexes on frequently queried columns (user_id, course_id, etc.)
- Timestamps with timezone for all records
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

-- Lesson types enum
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment');

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('course_update', 'new_review', 'certificate', 'payment', 'announcement', 'deadline');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  bio TEXT,
  headline TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  instructor_application_status TEXT DEFAULT 'pending',
  total_students INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  instructor_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  trailer_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_price DECIMAL(10,2),
  discount_ends_at TIMESTAMPTZ,
  level TEXT DEFAULT 'beginner',
  language TEXT DEFAULT 'English',
  duration_hours INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  requirements TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type lesson_type NOT NULL DEFAULT 'video',
  video_url TEXT,
  video_duration INTEGER DEFAULT 0,
  text_content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  resources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Lesson Progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Answers table (student submissions)
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_number TEXT UNIQUE NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_purchase DECIMAL(10,2),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status order_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Categories - public read for catalog browsing
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Courses - public read, instructor ownership
DROP POLICY IF EXISTS "courses_public_read" ON courses;
CREATE POLICY "courses_public_read" ON courses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "instructors_insert_courses" ON courses;
CREATE POLICY "instructors_insert_courses" ON courses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "instructors_update_courses" ON courses;
CREATE POLICY "instructors_update_courses" ON courses FOR UPDATE
  TO authenticated USING (auth.uid() = instructor_id) WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "instructors_delete_courses" ON courses;
CREATE POLICY "instructors_delete_courses" ON courses FOR DELETE
  TO authenticated USING (auth.uid() = instructor_id);

-- Lessons - public read for published courses, instructor management
DROP POLICY IF EXISTS "lessons_read_published" ON lessons;
CREATE POLICY "lessons_read_published" ON lessons FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.status = 'published')
  );

DROP POLICY IF EXISTS "instructors_insert_lessons" ON lessons;
CREATE POLICY "instructors_insert_lessons" ON lessons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid())
  );

DROP POLICY IF EXISTS "instructors_update_lessons" ON lessons;
CREATE POLICY "instructors_update_lessons" ON lessons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid())
  );

DROP POLICY IF EXISTS "instructors_delete_lessons" ON lessons;
CREATE POLICY "instructors_delete_lessons" ON lessons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid())
  );

-- Enrollments - user ownership only
DROP POLICY IF EXISTS "students_read_enrollments" ON enrollments;
CREATE POLICY "students_read_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_insert_enrollments" ON enrollments;
CREATE POLICY "students_insert_enrollments" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_update_enrollments" ON enrollments;
CREATE POLICY "students_update_enrollments" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Lesson Progress - user ownership only
DROP POLICY IF EXISTS "students_read_progress" ON lesson_progress;
CREATE POLICY "students_read_progress" ON lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_insert_progress" ON lesson_progress;
CREATE POLICY "students_insert_progress" ON lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_update_progress" ON lesson_progress;
CREATE POLICY "students_update_progress" ON lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews - user ownership, public read
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "students_insert_reviews" ON reviews;
CREATE POLICY "students_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_update_reviews" ON reviews;
CREATE POLICY "students_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_delete_reviews" ON reviews;
CREATE POLICY "students_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Wishlist - user ownership only
DROP POLICY IF EXISTS "students_read_wishlist" ON wishlist;
CREATE POLICY "students_read_wishlist" ON wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_insert_wishlist" ON wishlist;
CREATE POLICY "students_insert_wishlist" ON wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_delete_wishlist" ON wishlist;
CREATE POLICY "students_delete_wishlist" ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Quizzes - read via enrolled courses, instructors manage
DROP POLICY IF EXISTS "quizzes_read_enrolled" ON quizzes;
CREATE POLICY "quizzes_read_enrolled" ON quizzes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM lessons 
      JOIN courses ON courses.id = lessons.course_id
      LEFT JOIN enrollments ON enrollments.course_id = courses.id AND enrollments.user_id = auth.uid()
      WHERE lessons.id = quizzes.lesson_id AND (courses.status = 'published' OR enrollments.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "instructors_insert_quizzes" ON quizzes;
CREATE POLICY "instructors_insert_quizzes" ON quizzes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = quizzes.lesson_id AND courses.instructor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "instructors_update_quizzes" ON quizzes;
CREATE POLICY "instructors_update_quizzes" ON quizzes FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM lessons 
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = quizzes.lesson_id AND courses.instructor_id = auth.uid()
    )
  );

-- Quiz Questions - similar to quizzes
DROP POLICY IF EXISTS "questions_read_enrolled" ON quiz_questions;
CREATE POLICY "questions_read_enrolled" ON quiz_questions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN lessons ON lessons.id = quizzes.lesson_id
      JOIN courses ON courses.id = lessons.course_id
      LEFT JOIN enrollments ON enrollments.course_id = courses.id AND enrollments.user_id = auth.uid()
      WHERE quizzes.id = quiz_questions.quiz_id AND (courses.status = 'published' OR enrollments.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "instructors_manage_questions" ON quiz_questions;
CREATE POLICY "instructors_manage_questions" ON quiz_questions FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN lessons ON lessons.id = quizzes.lesson_id
      JOIN courses ON courses.id = lessons.course_id
      WHERE quizzes.id = quiz_questions.quiz_id AND courses.instructor_id = auth.uid()
    )
  );

-- Quiz Answers - student ownership only
DROP POLICY IF EXISTS "students_read_answers" ON quiz_answers;
CREATE POLICY "students_read_answers" ON quiz_answers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_insert_answers" ON quiz_answers;
CREATE POLICY "students_insert_answers" ON quiz_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Certificates - user ownership only
DROP POLICY IF EXISTS "students_read_certificates" ON certificates;
CREATE POLICY "students_read_certificates" ON certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "system_insert_certificates" ON certificates;
CREATE POLICY "system_insert_certificates" ON certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Coupons - instructors manage own, users read active
DROP POLICY IF EXISTS "coupons_read_active" ON coupons;
CREATE POLICY "coupons_read_active" ON coupons FOR SELECT
  TO anon, authenticated USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

DROP POLICY IF EXISTS "instructors_manage_coupons" ON coupons;
CREATE POLICY "instructors_manage_coupons" ON coupons FOR ALL
  TO authenticated USING (auth.uid() = instructor_id);

-- Orders - user ownership only
DROP POLICY IF EXISTS "students_read_orders" ON orders;
CREATE POLICY "students_read_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_insert_orders" ON orders;
CREATE POLICY "students_insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_update_orders" ON orders;
CREATE POLICY "students_update_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications - user ownership only
DROP POLICY IF EXISTS "users_read_notifications" ON notifications;
CREATE POLICY "users_read_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_notifications" ON notifications;
CREATE POLICY "users_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "system_insert_notifications" ON notifications;
CREATE POLICY "system_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for lessons
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for lesson_progress
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, order_index) VALUES
  ('Web Development', 'web-development', 'Learn web development including HTML, CSS, JavaScript, React, and more', 'code', 1),
  ('Mobile Development', 'mobile-development', 'Build mobile apps for iOS and Android', 'smartphone', 2),
  ('Data Science', 'data-science', 'Master data analysis, machine learning, and AI', 'chart-bar', 3),
  ('Design', 'design', 'UI/UX design, graphic design, and visual arts', 'palette', 4),
  ('Business', 'business', 'Entrepreneurship, marketing, and business strategy', 'briefcase', 5),
  ('Marketing', 'marketing', 'Digital marketing, SEO, social media, and content marketing', 'megaphone', 6),
  ('Photography', 'photography', 'Photography and video production', 'camera', 7),
  ('Music', 'music', 'Music production, instruments, and theory', 'music', 8)
ON CONFLICT (slug) DO NOTHING;