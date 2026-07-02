import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  documentId,
  getCountFromServer,
} from 'firebase/firestore'
import { db, IS_MOCK_MODE } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { Question, QuizAttempt, Bookmark, Note, RevisionQueue, DashboardStats } from '@/types/database'
import { calculateLevel } from '@/lib/utils'

// ─── Firestore helpers ────────────────────────────────────────────────────────
const ts = () => new Date().toISOString()

async function getCollection<T>(
  collectionName: string,
  userId: string,
  extraFilters: any[] = []
): Promise<T[]> {
  const q = query(
    collection(db, collectionName),
    where('user_id', '==', userId),
    ...extraFilters
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[]
}

// ─── Mock helpers (localStorage) ─────────────────────────────────────────────
function mockGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function mockSet(key: string, data: any[]) {
  localStorage.setItem(key, JSON.stringify(data))
}
function mockFilter<T extends { user_id?: string }>(key: string, userId: string): T[] {
  return mockGet<T>(key).filter(item => item.user_id === userId)
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useUserSubjects() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-subjects', user?.uid],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        return mockFilter<any>('mock_user_subjects', user.uid).map(s => s.subject)
      }
      const items = await getCollection<any>('user_subjects', user.uid)
      return items.map(s => s.subject)
    },
    enabled: !!user,
  })
}

export function useQuestions(filters?: { subject?: string; search?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['questions', user?.uid, filters],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<Question>('mock_questions', user.uid)
        if (filters?.subject && filters.subject !== 'all') {
          items = items.filter(q => q.subject === filters.subject)
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase()
          items = items.filter(q => q.question.toLowerCase().includes(s))
        }
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
      }
      let items = await getCollection<Question>('questions', user.uid)
      if (filters?.subject && filters.subject !== 'all') {
        items = items.filter(q => q.subject === filters.subject)
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase()
        items = items.filter(q => q.question.toLowerCase().includes(s))
      }
      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
    },
    enabled: !!user,
  })
}

export function useQuestion(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      if (!user || !id) return null
      if (IS_MOCK_MODE) {
        return mockFilter<Question>('mock_questions', user.uid).find(q => q.id === id) || null
      }
      const snap = await getDoc(doc(db, 'questions', id))
      if (!snap.exists() || snap.data()?.user_id !== user.uid) return null
      return { id: snap.id, ...snap.data() } as Question
    },
    enabled: !!user && !!id,
  })
}

export function useQuizAttempts(questionId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['quiz-attempts', user?.uid, questionId],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<QuizAttempt>('mock_quiz_attempts', user.uid)
        if (questionId) items = items.filter(a => a.question_id === questionId)
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
      let items = await getCollection<QuizAttempt>('quiz_attempts', user.uid)
      if (questionId) items = items.filter(a => a.question_id === questionId)
      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },
    enabled: !!user,
  })
}

export function useBookmarks() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['bookmarks', user?.uid],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        const bookmarks = mockFilter<any>('mock_bookmarks', user.uid)
        const questions = mockGet<Question>('mock_questions')
        return bookmarks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map(b => ({ ...b, questions: questions.find(q => q.id === b.question_id) || null }))
      }
      const bookmarks = await getCollection<any>('bookmarks', user.uid)
      const sorted = bookmarks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Fetch related questions (batch by 10)
      const qIds = [...new Set(sorted.map(b => b.question_id).filter(Boolean))]
      const questionsMap: Record<string, Question> = {}
      for (let i = 0; i < qIds.length; i += 10) {
        const batch = qIds.slice(i, i + 10)
        if (batch.length === 0) continue
        const snap = await getDocs(query(collection(db, 'questions'), where(documentId(), 'in', batch)))
        snap.docs.forEach(d => { questionsMap[d.id] = { id: d.id, ...d.data() } as Question })
      }
      return sorted.map(b => ({ ...b, questions: questionsMap[b.question_id] || null }))
    },
    enabled: !!user,
  })
}

export function useNotes(filters?: { subject?: string; noteType?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notes', user?.uid, filters],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<Note>('mock_notes', user.uid)
        if (filters?.subject && filters.subject !== 'all') items = items.filter(n => n.subject === filters.subject)
        if (filters?.noteType && filters.noteType !== 'all') items = items.filter(n => n.note_type === filters.noteType)
        return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      }
      let items = await getCollection<Note>('notes', user.uid)
      if (filters?.subject && filters.subject !== 'all') items = items.filter(n => n.subject === filters.subject)
      if (filters?.noteType && filters.noteType !== 'all') items = items.filter(n => n.note_type === filters.noteType)
      return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    },
    enabled: !!user,
  })
}

export function useRevisionQueue() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['revision-queue', user?.uid],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        const queue = mockFilter<any>('mock_revision_queue', user.uid).filter(r => !r.completed)
        const questions = mockGet<Question>('mock_questions')
        return queue
          .sort((a, b) => b.priority - a.priority)
          .map(r => ({ ...r, questions: questions.find(q => q.id === r.question_id) || null }))
      }
      const queue = (await getCollection<any>('revision_queue', user.uid)).filter(r => !r.completed)
      const sorted = queue.sort((a, b) => (b.priority || 0) - (a.priority || 0))

      const qIds = [...new Set(sorted.map(r => r.question_id).filter(Boolean))]
      const questionsMap: Record<string, Question> = {}
      for (let i = 0; i < qIds.length; i += 10) {
        const batch = qIds.slice(i, i + 10)
        if (batch.length === 0) continue
        const snap = await getDocs(query(collection(db, 'questions'), where(documentId(), 'in', batch)))
        snap.docs.forEach(d => { questionsMap[d.id] = { id: d.id, ...d.data() } as Question })
      }
      return sorted.map(r => ({ ...r, questions: questionsMap[r.question_id] || null }))
    },
    enabled: !!user,
  })
}

export function useAchievements() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['achievements', user?.uid],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) return mockFilter('mock_achievements', user.uid)
      return getCollection('achievements', user.uid)
    },
    enabled: !!user,
  })
}

export function useXPHistory() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['xp-history', user?.uid],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        return mockFilter<any>('mock_xp_history', user.uid)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50)
      }
      const items = await getCollection<any>('xp_history', user.uid)
      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
    },
    enabled: !!user,
  })
}

export function useDashboardStats() {
  const { user, profile } = useAuth()

  return useQuery({
    queryKey: ['dashboard-stats', user?.uid],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('Not authenticated')

      let questions: Question[] = []
      let quizAttempts: any[] = []
      let bookmarksCount = 0
      let notesCount = 0
      let revisionCount = 0
      let recentQuestions: Question[] = []

      if (IS_MOCK_MODE) {
        questions = mockFilter<Question>('mock_questions', user.uid)
        quizAttempts = mockFilter<any>('mock_quiz_attempts', user.uid)
        bookmarksCount = mockFilter('mock_bookmarks', user.uid).length
        notesCount = mockFilter('mock_notes', user.uid).length
        revisionCount = mockFilter<any>('mock_revision_queue', user.uid).filter(r => !r.completed).length
        recentQuestions = questions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      } else {
        questions = await getCollection<Question>('questions', user.uid)
        quizAttempts = await getCollection<any>('quiz_attempts', user.uid)

        const [bSnap, nSnap, rSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'bookmarks'), where('user_id', '==', user.uid))),
          getCountFromServer(query(collection(db, 'notes'), where('user_id', '==', user.uid))),
          getCountFromServer(query(collection(db, 'revision_queue'), where('user_id', '==', user.uid), where('completed', '==', false))),
        ])
        bookmarksCount = bSnap.data().count
        notesCount = nSnap.data().count
        revisionCount = rSnap.data().count
        recentQuestions = questions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      }

      const totalQuestions = questions.length
      const totalQuizzes = quizAttempts.length
      const averageScore = totalQuizzes > 0
        ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalQuizzes)
        : 0

      const subjectMap: Record<string, { count: number }> = {}
      questions.forEach(q => {
        if (!subjectMap[q.subject]) subjectMap[q.subject] = { count: 0 }
        subjectMap[q.subject].count++
      })

      const subjectProgress = Object.entries(subjectMap).map(([subject, data]) => ({
        subject,
        questionsAsked: data.count,
        quizzesCompleted: 0,
        averageScore: 0,
        lastStudied: null,
      }))

      const today = new Date()
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - (6 - i))
        const dateStr = date.toISOString().split('T')[0]
        const count = questions.filter(q => q.created_at?.startsWith(dateStr)).length
        return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()], count }
      })

      const levelData = calculateLevel(profile?.xp || 0)

      return {
        totalQuestions,
        totalQuizzes,
        averageScore,
        currentStreak: profile?.streak || 0,
        longestStreak: profile?.longest_streak || 0,
        xp: profile?.xp || 0,
        level: levelData.level,
        bookmarksCount,
        notesCount,
        revisionQueueCount: revisionCount,
        subjectProgress,
        recentActivity: recentQuestions,
        weeklyActivity,
      }
    },
    enabled: !!user,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSaveQuestion() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      question: string
      answer: string
      story_answer?: string
      subject: string
      difficulty: string
      mode: string
      style: string
      follow_up_questions?: string[]
    }) => {
      if (!user) throw new Error('Not authenticated')
      const payload = {
        user_id: user.uid,
        ...data,
        follow_up_questions: data.follow_up_questions || null,
        created_at: ts(),
      }
      if (IS_MOCK_MODE) {
        const id = crypto.randomUUID()
        const item = { id, ...payload }
        const existing = mockGet<Question>('mock_questions')
        mockSet('mock_questions', [item, ...existing])
        return item as Question
      }
      const ref = await addDoc(collection(db, 'questions'), payload)
      return { id: ref.id, ...payload } as Question
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useSaveQuizAttempt() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      question_id: string
      quiz_data: object
      answers: object
      score: number
      percentage: number
      mastery_level: string
      weak_areas: string[]
      strong_areas: string[]
    }) => {
      if (!user) throw new Error('Not authenticated')
      const payload = { user_id: user.uid, ...data, created_at: ts() }
      if (IS_MOCK_MODE) {
        const id = crypto.randomUUID()
        const item = { id, ...payload }
        const existing = mockGet<any>('mock_quiz_attempts')
        mockSet('mock_quiz_attempts', [item, ...existing])
        return item as QuizAttempt
      }
      const ref = await addDoc(collection(db, 'quiz_attempts'), payload)
      return { id: ref.id, ...payload } as QuizAttempt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useToggleBookmark() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ questionId, type = 'answer' }: { questionId: string; type?: string }) => {
      if (!user) throw new Error('Not authenticated')
      if (IS_MOCK_MODE) {
        const all = mockGet<any>('mock_bookmarks')
        const existing = all.find((b: any) => b.user_id === user.uid && b.question_id === questionId)
        if (existing) {
          mockSet('mock_bookmarks', all.filter((b: any) => b.id !== existing.id))
          return { action: 'removed' }
        }
        mockSet('mock_bookmarks', [{ id: crypto.randomUUID(), user_id: user.uid, question_id: questionId, bookmark_type: type, created_at: ts() }, ...all])
        return { action: 'added' }
      }
      const existing = (await getCollection<any>('bookmarks', user.uid)).find(b => b.question_id === questionId)
      if (existing) {
        await deleteDoc(doc(db, 'bookmarks', existing.id))
        return { action: 'removed' }
      }
      await addDoc(collection(db, 'bookmarks'), { user_id: user.uid, question_id: questionId, bookmark_type: type, created_at: ts() })
      return { action: 'added' }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useSaveNote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      question_id?: string
      title: string
      content: string
      note_type: string
      subject: string
    }) => {
      if (!user) throw new Error('Not authenticated')
      const now = ts()
      const payload = { user_id: user.uid, ...data, created_at: now, updated_at: now }
      if (IS_MOCK_MODE) {
        const id = crypto.randomUUID()
        const item = { id, ...payload }
        mockSet('mock_notes', [item, ...mockGet('mock_notes')])
        return item as Note
      }
      const ref = await addDoc(collection(db, 'notes'), payload)
      return { id: ref.id, ...payload } as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      if (IS_MOCK_MODE) {
        mockSet('mock_notes', mockGet<Note>('mock_notes').filter((n: any) => n.id !== noteId))
        return
      }
      await deleteDoc(doc(db, 'notes', noteId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useAddToRevisionQueue() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ questionId, priority = 1 }: { questionId: string; priority?: number }) => {
      if (!user) throw new Error('Not authenticated')
      if (IS_MOCK_MODE) {
        const all = mockGet<any>('mock_revision_queue')
        const existing = all.find((r: any) => r.user_id === user.uid && r.question_id === questionId)
        if (existing) {
          mockSet('mock_revision_queue', all.map((r: any) => r.id === existing.id ? { ...r, priority, completed: false } : r))
        } else {
          mockSet('mock_revision_queue', [...all, { id: crypto.randomUUID(), user_id: user.uid, question_id: questionId, priority, completed: false, created_at: ts() }])
        }
        return
      }
      // Check if already exists
      const existing = (await getCollection<any>('revision_queue', user.uid)).find(r => r.question_id === questionId)
      if (existing) {
        await updateDoc(doc(db, 'revision_queue', existing.id), { priority, completed: false })
      } else {
        await addDoc(collection(db, 'revision_queue'), { user_id: user.uid, question_id: questionId, priority, completed: false, created_at: ts() })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-queue'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useAwardXP() {
  const queryClient = useQueryClient()
  const { user, profile, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async ({ action, amount, description }: { action: string; amount: number; description?: string }) => {
      if (!user) throw new Error('Not authenticated')
      if (IS_MOCK_MODE) {
        // Update mock XP
        const profiles = mockGet<any>('mock_supabase_profiles')
        const newXP = (profile?.xp || 0) + amount
        const levelData = calculateLevel(newXP)
        mockSet('mock_supabase_profiles', profiles.map((p: any) =>
          p.id === user.uid ? { ...p, xp: newXP, level: levelData.level } : p
        ))
        mockSet('mock_xp_history', [
          { id: crypto.randomUUID(), user_id: user.uid, xp_amount: amount, action, description, created_at: ts() },
          ...mockGet('mock_xp_history'),
        ])
        return
      }
      await addDoc(collection(db, 'xp_history'), { user_id: user.uid, xp_amount: amount, action, description: description || null, created_at: ts() })
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid))
      const newXP = ((profileSnap.data()?.xp) || 0) + amount
      const levelData = calculateLevel(newXP)
      await updateDoc(doc(db, 'profiles', user.uid), { xp: newXP, level: levelData.level, last_active: ts() })
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['xp-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateSubjects() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (subjects: string[]) => {
      if (!user) throw new Error('Not authenticated')
      if (IS_MOCK_MODE) {
        const all = mockGet<any>('mock_user_subjects').filter((s: any) => s.user_id !== user.uid)
        mockSet('mock_user_subjects', [...all, ...subjects.map(subject => ({ id: crypto.randomUUID(), user_id: user.uid, subject, created_at: ts() }))])
        return
      }
      // Delete existing
      const existing = await getCollection<any>('user_subjects', user.uid)
      await Promise.all(existing.map(s => deleteDoc(doc(db, 'user_subjects', s.id))))
      // Insert new
      await Promise.all(subjects.map(subject => addDoc(collection(db, 'user_subjects'), { user_id: user.uid, subject, created_at: ts() })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subjects'] })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async (updates: {
      full_name?: string
      avatar_url?: string
      theme?: string
      notifications_enabled?: boolean
      onboarding_completed?: boolean
    }) => {
      if (!user) throw new Error('Not authenticated')
      const payload = { ...updates, updated_at: ts() }
      if (IS_MOCK_MODE) {
        const profiles = mockGet<any>('mock_supabase_profiles')
        mockSet('mock_supabase_profiles', profiles.map((p: any) => p.id === user.uid ? { ...p, ...payload } : p))
        return
      }
      await updateDoc(doc(db, 'profiles', user.uid), payload)
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
