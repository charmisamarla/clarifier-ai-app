import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(date)
  if (days > 1) return `${days} days ago`
  if (days === 1) return 'Yesterday'
  if (hours > 1) return `${hours} hours ago`
  if (hours === 1) return '1 hour ago'
  if (minutes > 1) return `${minutes} minutes ago`
  return 'Just now'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; currentLevelXp: number } {
  const levels = [
    { level: 1, title: 'Curious Learner', xpRequired: 0 },
    { level: 2, title: 'Knowledge Seeker', xpRequired: 100 },
    { level: 3, title: 'Concept Explorer', xpRequired: 300 },
    { level: 4, title: 'Skill Builder', xpRequired: 600 },
    { level: 5, title: 'Understanding Master', xpRequired: 1000 },
    { level: 6, title: 'Domain Expert', xpRequired: 1500 },
    { level: 7, title: 'Knowledge Architect', xpRequired: 2200 },
    { level: 8, title: 'Wisdom Keeper', xpRequired: 3000 },
    { level: 9, title: 'Scholar Elite', xpRequired: 4000 },
    { level: 10, title: 'Grand Master', xpRequired: 5500 },
    { level: 11, title: 'Enlightened Sage', xpRequired: 7500 },
    { level: 12, title: 'Legend', xpRequired: 10000 },
  ]

  let currentLevel = levels[0]
  let nextLevel = levels[1]

  for (let i = 0; i < levels.length - 1; i++) {
    if (xp >= levels[i].xpRequired) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1] || levels[i]
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelXp: nextLevel.xpRequired,
    currentLevelXp: currentLevel.xpRequired,
  }
}

export function calculateXpForAction(action: string): number {
  const xpMap: Record<string, number> = {
    ask_question: 10,
    complete_quiz: 20,
    perfect_quiz: 50,
    daily_streak: 25,
    bookmark: 5,
    create_notes: 15,
    complete_revision: 20,
  }
  return xpMap[action] || 5
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    Mathematics: 'from-blue-500 to-cyan-500',
    Physics: 'from-purple-500 to-indigo-500',
    Chemistry: 'from-green-500 to-teal-500',
    Biology: 'from-emerald-500 to-green-600',
    English: 'from-yellow-500 to-orange-500',
    'Computer Science': 'from-slate-500 to-blue-600',
    Java: 'from-orange-500 to-red-500',
    Python: 'from-yellow-400 to-blue-500',
    JavaScript: 'from-yellow-400 to-yellow-600',
    TypeScript: 'from-blue-400 to-blue-600',
    React: 'from-cyan-400 to-blue-500',
    'Node.js': 'from-green-500 to-emerald-600',
    HTML: 'from-orange-400 to-red-400',
    CSS: 'from-blue-400 to-indigo-500',
    SQL: 'from-indigo-400 to-purple-500',
    DBMS: 'from-violet-500 to-purple-600',
    'Operating Systems': 'from-gray-500 to-slate-600',
    'Computer Networks': 'from-teal-500 to-cyan-600',
    'Data Structures': 'from-rose-500 to-pink-600',
    Algorithms: 'from-red-500 to-rose-600',
    'Artificial Intelligence': 'from-violet-500 to-indigo-600',
    'Machine Learning': 'from-purple-500 to-violet-600',
    'Deep Learning': 'from-indigo-500 to-blue-700',
    Statistics: 'from-cyan-500 to-blue-600',
    'Data Science': 'from-blue-500 to-violet-600',
    'Cloud Computing': 'from-sky-400 to-blue-500',
    'Cyber Security': 'from-red-600 to-rose-700',
    JEE: 'from-amber-500 to-orange-600',
    NEET: 'from-green-500 to-teal-600',
    GATE: 'from-blue-600 to-indigo-700',
    UPSC: 'from-orange-600 to-red-700',
    CAT: 'from-purple-600 to-pink-700',
    C: 'from-gray-600 to-slate-700',
    'C++': 'from-blue-600 to-slate-600',
  }
  return colors[subject] || 'from-primary to-violet-600'
}

export function getSubjectIcon(subject: string): string {
  const icons: Record<string, string> = {
    Mathematics: '∑',
    Physics: '⚛',
    Chemistry: '🧪',
    Biology: '🧬',
    English: '📚',
    'Computer Science': '💻',
    Java: '☕',
    Python: '🐍',
    JavaScript: '⚡',
    TypeScript: '📘',
    React: '⚛',
    'Node.js': '🟢',
    HTML: '🌐',
    CSS: '🎨',
    SQL: '🗄',
    DBMS: '🗃',
    'Operating Systems': '⚙',
    'Computer Networks': '🌐',
    'Data Structures': '🌳',
    Algorithms: '🔍',
    'Artificial Intelligence': '🤖',
    'Machine Learning': '🧠',
    'Deep Learning': '🔮',
    Statistics: '📊',
    'Data Science': '📈',
    'Cloud Computing': '☁',
    'Cyber Security': '🔒',
    JEE: '🎯',
    NEET: '🏥',
    GATE: '🎓',
    UPSC: '🏛',
    CAT: '📋',
    C: '©',
    'C++': '🔵',
  }
  return icons[subject] || '📖'
}

export function generateAvatarUrl(name: string, email: string): string {
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=6272f3&textColor=ffffff`
}

export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
}

export function getMonthName(month: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2024, month, 1))
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function parseQuizFromJSON(jsonStr: string) {
  try {
    // Try to extract JSON from possible markdown wrapping
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch {
    return null
  }
}
