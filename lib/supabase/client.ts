import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'student' | 'instructor' | 'admin';
          bio: string | null;
          headline: string | null;
          website_url: string | null;
          social_links: Record<string, string>;
          instructor_application_status: string | null;
          total_students: number;
          total_courses: number;
          total_earnings: number;
          email_notifications: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'instructor' | 'admin';
          bio?: string | null;
          headline?: string | null;
          website_url?: string | null;
          social_links?: Record<string, string>;
          instructor_application_status?: string | null;
          total_students?: number;
          total_courses?: number;
          total_earnings?: number;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'instructor' | 'admin';
          bio?: string | null;
          headline?: string | null;
          website_url?: string | null;
          social_links?: Record<string, string>;
          instructor_application_status?: string | null;
          total_students?: number;
          total_courses?: number;
          total_earnings?: number;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          parent_id: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          description: string;
          instructor_id: string;
          category_id: string | null;
          cover_image_url: string | null;
          trailer_url: string | null;
          price: number;
          discount_price: number | null;
          discount_ends_at: string | null;
          level: string;
          language: string;
          duration_hours: number;
          total_lessons: number;
          total_students: number;
          average_rating: number;
          total_reviews: number;
          status: string;
          featured: boolean;
          published_at: string | null;
          requirements: string[];
          learning_objectives: string[];
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          description: string;
          instructor_id?: string;
          category_id?: string | null;
          cover_image_url?: string | null;
          trailer_url?: string | null;
          price?: number;
          discount_price?: number | null;
          discount_ends_at?: string | null;
          level?: string;
          language?: string;
          duration_hours?: number;
          total_lessons?: number;
          total_students?: number;
          average_rating?: number;
          total_reviews?: number;
          status?: string;
          featured?: boolean;
          published_at?: string | null;
          requirements?: string[];
          learning_objectives?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          description?: string;
          instructor_id?: string;
          category_id?: string | null;
          cover_image_url?: string | null;
          trailer_url?: string | null;
          price?: number;
          discount_price?: number | null;
          discount_ends_at?: string | null;
          level?: string;
          language?: string;
          duration_hours?: number;
          total_lessons?: number;
          total_students?: number;
          average_rating?: number;
          total_reviews?: number;
          status?: string;
          featured?: boolean;
          published_at?: string | null;
          requirements?: string[];
          learning_objectives?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          lesson_type: 'video' | 'text' | 'quiz' | 'assignment';
          video_url: string | null;
          video_duration: number;
          text_content: string | null;
          order_index: number;
          is_preview: boolean;
          resources: unknown[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          lesson_type?: 'video' | 'text' | 'quiz' | 'assignment';
          video_url?: string | null;
          video_duration?: number;
          text_content?: string | null;
          order_index?: number;
          is_preview?: boolean;
          resources?: unknown[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          lesson_type?: 'video' | 'text' | 'quiz' | 'assignment';
          video_url?: string | null;
          video_duration?: number;
          text_content?: string | null;
          order_index?: number;
          is_preview?: boolean;
          resources?: unknown[];
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          completed_lessons: number;
          total_time_spent: number;
          last_accessed_at: string | null;
          completed_at: string | null;
          certificate_issued: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          progress?: number;
          completed_lessons?: number;
          total_time_spent?: number;
          last_accessed_at?: string | null;
          completed_at?: string | null;
          certificate_issued?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress?: number;
          completed_lessons?: number;
          total_time_spent?: number;
          last_accessed_at?: string | null;
          completed_at?: string | null;
          certificate_issued?: boolean;
          created_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          completed: boolean;
          time_spent: number;
          last_position: number;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          lesson_id: string;
          course_id: string;
          completed?: boolean;
          time_spent?: number;
          last_position?: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          course_id?: string;
          completed?: boolean;
          time_spent?: number;
          last_position?: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          content: string | null;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          rating: number;
          content?: string | null;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          rating?: number;
          content?: string | null;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          created_at?: string;
        };
        Update: {};
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description: string | null;
          passing_score: number;
          max_attempts: number;
          time_limit: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          description?: string | null;
          passing_score?: number;
          max_attempts?: number;
          time_limit?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          description?: string | null;
          passing_score?: number;
          max_attempts?: number;
          time_limit?: number | null;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          question_type: string;
          options: unknown[];
          correct_answer: string;
          explanation: string | null;
          points: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          question_type?: string;
          options?: unknown[];
          correct_answer: string;
          explanation?: string | null;
          points?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          question_type?: string;
          options?: unknown[];
          correct_answer?: string;
          explanation?: string | null;
          points?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      quiz_answers: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          question_id: string;
          answer: string;
          is_correct: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          quiz_id: string;
          question_id: string;
          answer: string;
          is_correct?: boolean;
          created_at?: string;
        };
        Update: {};
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrollment_id: string;
          certificate_url: string;
          issued_at: string;
          certificate_number: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          enrollment_id: string;
          certificate_url: string;
          issued_at?: string;
          certificate_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {};
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_uses: number | null;
          current_uses: number;
          min_purchase: number | null;
          valid_from: string;
          valid_until: string | null;
          course_id: string | null;
          instructor_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type?: string;
          discount_value: number;
          max_uses?: number | null;
          current_uses?: number;
          min_purchase?: number | null;
          valid_from?: string;
          valid_until?: string | null;
          course_id?: string | null;
          instructor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          max_uses?: number | null;
          current_uses?: number;
          min_purchase?: number | null;
          valid_from?: string;
          valid_until?: string | null;
          course_id?: string | null;
          instructor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount: number;
          discount_amount: number;
          final_amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: string | null;
          payment_id: string | null;
          coupon_id: string | null;
          invoice_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          amount: number;
          discount_amount?: number;
          final_amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_id?: string | null;
          coupon_id?: string | null;
          invoice_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          amount?: number;
          discount_amount?: number;
          final_amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_id?: string | null;
          coupon_id?: string | null;
          invoice_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'course_update' | 'new_review' | 'certificate' | 'payment' | 'announcement' | 'deadline';
          title: string;
          message: string;
          data: Record<string, unknown>;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'course_update' | 'new_review' | 'certificate' | 'payment' | 'announcement' | 'deadline';
          title: string;
          message: string;
          data?: Record<string, unknown>;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'course_update' | 'new_review' | 'certificate' | 'payment' | 'announcement' | 'deadline';
          title?: string;
          message?: string;
          data?: Record<string, unknown>;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Wishlist = Database['public']['Tables']['wishlist']['Row'];
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
