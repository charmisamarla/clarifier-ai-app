export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          xp: number
          level: number
          streak: number
          longest_streak: number
          last_active: string | null
          onboarding_completed: boolean
          theme: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          xp?: number
          level?: number
          streak?: number
          longest_streak?: number
          last_active?: string | null
          onboarding_completed?: boolean
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          xp?: number
          level?: number
          streak?: number
          longest_streak?: number
          last_active?: string | null
          onboarding_completed?: boolean
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subjects: {
        Row: {
          id: string
          user_id: string
          subject: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          user_id: string
          question: string
          answer: string
          story_answer: string | null
          subject: string
          difficulty: string
          mode: string
          style: string
          follow_up_questions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          answer: string
          story_answer?: string | null
          subject: string
          difficulty: string
          mode: string
          style: string
          follow_up_questions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          answer?: string
          story_answer?: string | null
          subject?: string
          difficulty?: string
          mode?: string
          style?: string
          follow_up_questions?: Json | null
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          quiz_data: Json
          answers: Json
          score: number
          percentage: number
          mastery_level: string
          weak_areas: Json
          strong_areas: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          quiz_data: Json
          answers: Json
          score: number
          percentage: number
          mastery_level: string
          weak_areas?: Json
          strong_areas?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          quiz_data?: Json
          answers?: Json
          score?: number
          percentage?: number
          mastery_level?: string
          weak_areas?: Json
          strong_areas?: Json
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          question_id: string
          bookmark_type: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          bookmark_type: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          bookmark_type?: string
          note?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          question_id: string | null
          title: string
          content: string
          note_type: string
          subject: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id?: string | null
          title: string
          content: string
          note_type: string
          subject: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string | null
          title?: string
          content?: string
          note_type?: string
          subject?: string
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      xp_history: {
        Row: {
          id: string
          user_id: string
          xp_amount: number
          action: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp_amount: number
          action: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp_amount?: number
          action?: string
          description?: string | null
          created_at?: string
        }
      }
      revision_queue: {
        Row: {
          id: string
          user_id: string
          question_id: string
          priority: number
          scheduled_for: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          priority?: number
          scheduled_for?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          priority?: number
          scheduled_for?: string | null
          completed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Derived types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserSubject = Database['public']['Tables']['user_subjects']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type XPHistory = Database['public']['Tables']['xp_history']['Row']
export type RevisionQueue = Database['public']['Tables']['revision_queue']['Row']

export interface QuizData {
  mcq: MCQQuestion[]
  trueFalse: TrueFalseQuestion[]
  fillBlanks: FillBlankQuestion[]
  scenario: ScenarioQuestion
}

export interface MCQQuestion {
  id: number
  question: string
  options: string[]
  correct: string
  explanation: string
}

export interface TrueFalseQuestion {
  id: number
  statement: string
  correct: boolean
  explanation: string
}

export interface FillBlankQuestion {
  id: number
  sentence: string
  blanks: string[]
  explanation: string
}

export interface ScenarioQuestion {
  id: number
  scenario: string
  question: string
  expectedAnswer: string
  keyPoints: string[]
}

export interface QuizAnswers {
  mcq: Record<number, string>
  trueFalse: Record<number, boolean | null>
  fillBlanks: Record<number, string[]>
  scenario: string
}

export interface PerformanceResult {
  score: number
  total: number
  percentage: number
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert'
  conceptClarity: number
  confidenceScore: number
  weakAreas: string[]
  strongAreas: string[]
  suggestedRevision: string[]
  suggestedNextTopic: string
}

export interface SubjectProgress {
  subject: string
  questionsAsked: number
  quizzesCompleted: number
  averageScore: number
  lastStudied: string | null
}

export interface DashboardStats {
  totalQuestions: number
  totalQuizzes: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  xp: number
  level: number
  bookmarksCount: number
  notesCount: number
  revisionQueueCount: number
  subjectProgress: SubjectProgress[]
  recentActivity: Question[]
  weeklyActivity: { day: string; count: number }[]
}
