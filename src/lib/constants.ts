export const ALL_SUBJECTS = [
  'Mathematics',
  'Physics', 
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'Java',
  'Python',
  'C',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'HTML',
  'CSS',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Data Structures',
  'Algorithms',
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Statistics',
  'Data Science',
  'Cloud Computing',
  'Cyber Security',
  'JEE',
  'NEET',
  'GATE',
  'UPSC',
  'CAT',
] as const

export type Subject = typeof ALL_SUBJECTS[number]

export const LEARNING_MODES = [
  { id: 'standard', label: 'Standard', description: 'Clear comprehensive explanation', icon: '📖' },
  { id: 'story', label: 'Story Mode', description: 'Learn through engaging narratives', icon: '📚' },
  { id: 'eli5', label: "Explain Like I'm 10", description: 'Simple, fun explanations', icon: '🧒' },
  { id: 'step-by-step', label: 'Step by Step', description: 'Sequential breakdown', icon: '📋' },
  { id: 'exam-prep', label: 'Exam Preparation', description: 'Exam-focused explanations', icon: '🎯' },
  { id: 'interview-prep', label: 'Interview Preparation', description: 'Interview-ready explanations', icon: '💼' },
] as const

export const TUTOR_STYLES = [
  { id: 'teacher', label: 'Teacher', description: 'Patient and structured', icon: '👩‍🏫' },
  { id: 'professor', label: 'Professor', description: 'Academic and rigorous', icon: '🎓' },
  { id: 'friend', label: 'Friend', description: 'Casual and relatable', icon: '🤝' },
  { id: 'storyteller', label: 'Story Teller', description: 'Narrative and engaging', icon: '📖' },
  { id: 'mentor', label: 'Mentor', description: 'Guiding and supportive', icon: '🌟' },
] as const

export const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'intermediate', label: 'Intermediate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'advanced', label: 'Advanced', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
] as const

export const ACHIEVEMENTS = [
  { id: 'first_question', name: 'First Step', description: 'Asked your first question', icon: '🎯', xp: 50, condition: 'questions_asked >= 1' },
  { id: 'curious_10', name: 'Curious Mind', description: 'Asked 10 questions', icon: '🔍', xp: 100, condition: 'questions_asked >= 10' },
  { id: 'scholar_50', name: 'Scholar', description: 'Asked 50 questions', icon: '📚', xp: 200, condition: 'questions_asked >= 50' },
  { id: 'first_quiz', name: 'Quiz Starter', description: 'Completed your first quiz', icon: '✅', xp: 50, condition: 'quizzes_completed >= 1' },
  { id: 'perfect_quiz', name: 'Perfect Score', description: 'Got 100% on a quiz', icon: '🏆', xp: 150, condition: 'perfect_quizzes >= 1' },
  { id: 'streak_3', name: 'On Fire', description: '3-day learning streak', icon: '🔥', xp: 75, condition: 'streak >= 3' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day learning streak', icon: '⚡', xp: 150, condition: 'streak >= 7' },
  { id: 'streak_30', name: 'Unstoppable', description: '30-day learning streak', icon: '💎', xp: 500, condition: 'streak >= 30' },
  { id: 'bookmarker', name: 'Bookworm', description: 'Saved 10 bookmarks', icon: '🔖', xp: 75, condition: 'bookmarks >= 10' },
  { id: 'note_taker', name: 'Note Ninja', description: 'Created 5 notes', icon: '📝', xp: 100, condition: 'notes >= 5' },
  { id: 'level_5', name: 'Rising Star', description: 'Reached Level 5', icon: '⭐', xp: 200, condition: 'level >= 5' },
  { id: 'multi_subject', name: 'Renaissance', description: 'Studied 5+ subjects', icon: '🎨', xp: 150, condition: 'subjects >= 5' },
] as const

export const QUICK_QUESTIONS = [
  'Explain recursion with an example',
  'What is Newton\'s Second Law?',
  'How does photosynthesis work?',
  'What is the difference between stack and queue?',
  'Explain time complexity in Big O notation',
  'What are React hooks and why use them?',
  'Explain SQL joins with examples',
  'What is machine learning?',
  'How does TCP/IP work?',
  'Explain inheritance in OOP',
]
