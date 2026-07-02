// ─── Firestore entity types ───────────────────────────────────────────────────
// These match the Firestore document structure for each collection.
// The `id` field is the Firestore document ID (same as Firebase Auth uid for profiles).

export interface Profile {
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

export interface UserSubject {
  id: string
  user_id: string
  subject: string
  created_at: string
}

export interface Question {
  id: string
  user_id: string
  question: string
  answer: string
  story_answer: string | null
  subject: string
  difficulty: string
  mode: string
  style: string
  follow_up_questions: string[] | null
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  question_id: string
  quiz_data: object
  answers: object
  score: number
  percentage: number
  mastery_level: string
  weak_areas: string[]
  strong_areas: string[]
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  bookmark_type: string
  note: string | null
  created_at: string
}

export interface Note {
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

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export interface XPHistory {
  id: string
  user_id: string
  xp_amount: number
  action: string
  description: string | null
  created_at: string
}

export interface RevisionQueue {
  id: string
  user_id: string
  question_id: string
  priority: number
  scheduled_for: string | null
  completed: boolean
  created_at: string
}

// ─── Quiz / quiz attempt types ────────────────────────────────────────────────

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
