import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, IS_MOCK_MODE } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Question, QuizAttempt, Bookmark, Note, RevisionQueue, DashboardStats } from '@/types/database'
import { calculateLevel } from '@/lib/utils'

// ─── Timestamp helper ─────────────────────────────────────────────────────────
const ts = () => new Date().toISOString()

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
    queryKey: ['user-subjects', user?.id],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        return mockFilter<any>('mock_user_subjects', user.id).map(s => s.subject)
      }
      const { data, error } = await supabase
        .from('user_subjects')
        .select('subject')
        .eq('user_id', user.id)
      if (error) throw error
      return (data || []).map(s => s.subject)
    },
    enabled: !!user,
  })
}

export function useQuestions(filters?: { subject?: string; search?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['questions', user?.id, filters],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<Question>('mock_questions', user.id)
        if (filters?.subject && filters.subject !== 'all') {
          items = items.filter(q => q.subject === filters.subject)
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase()
          items = items.filter(q => q.question.toLowerCase().includes(s))
        }
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
      }
      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (filters?.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }
      const { data, error } = await query
      if (error) throw error
      let items = (data || []) as Question[]
      if (filters?.search) {
        const s = filters.search.toLowerCase()
        items = items.filter(q => q.question.toLowerCase().includes(s))
      }
      return items
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
        return mockFilter<Question>('mock_questions', user.id).find(q => q.id === id) || null
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (error) return null
      return data as Question
    },
    enabled: !!user && !!id,
  })
}

export function useQuizAttempts(questionId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['quiz-attempts', user?.id, questionId],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<QuizAttempt>('mock_quiz_attempts', user.id)
        if (questionId) items = items.filter(a => a.question_id === questionId)
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (questionId) query = query.eq('question_id', questionId)
      const { data, error } = await query
      if (error) throw error
      return (data || []) as QuizAttempt[]
    },
    enabled: !!user,
  })
}

export function useBookmarks() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        const bookmarks = mockFilter<any>('mock_bookmarks', user.id)
        const questions = mockGet<Question>('mock_questions')
        return bookmarks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map(b => ({ ...b, questions: questions.find(q => q.id === b.question_id) || null }))
      }
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, questions(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useNotes(filters?: { subject?: string; noteType?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notes', user?.id, filters],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        let items = mockFilter<Note>('mock_notes', user.id)
        if (filters?.subject && filters.subject !== 'all') items = items.filter(n => n.subject === filters.subject)
        if (filters?.noteType && filters.noteType !== 'all') items = items.filter(n => n.note_type === filters.noteType)
        return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      }
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (filters?.subject && filters.subject !== 'all') query = query.eq('subject', filters.subject)
      if (filters?.noteType && filters.noteType !== 'all') query = query.eq('note_type', filters.noteType)
      const { data, error } = await query
      if (error) throw error
      return (data || []) as Note[]
    },
    enabled: !!user,
  })
}

export function useRevisionQueue() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['revision-queue', user?.id],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        const queue = mockFilter<any>('mock_revision_queue', user.id).filter(r => !r.completed)
        const questions = mockGet<Question>('mock_questions')
        return queue
          .sort((a, b) => b.priority - a.priority)
          .map(r => ({ ...r, questions: questions.find(q => q.id === r.question_id) || null }))
      }
      const { data, error } = await supabase
        .from('revision_queue')
        .select('*, questions(*)')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('priority', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useAchievements() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) return mockFilter('mock_achievements', user.id)
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useXPHistory() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['xp-history', user?.id],
    queryFn: async () => {
      if (!user) return []
      if (IS_MOCK_MODE) {
        return mockFilter<any>('mock_xp_history', user.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50)
      }
      const { data, error } = await supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useDashboardStats() {
  const { user, profile } = useAuth()

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('Not authenticated')

      let questions: Question[] = []
      let quizAttempts: any[] = []
      let bookmarksCount = 0
      let notesCount = 0
      let revisionCount = 0
      let recentQuestions: Question[] = []

      if (IS_MOCK_MODE) {
        questions = mockFilter<Question>('mock_questions', user.id)
        quizAttempts = mockFilter<any>('mock_quiz_attempts', user.id)
        bookmarksCount = mockFilter('mock_bookmarks', user.id).length
        notesCount = mockFilter('mock_notes', user.id).length
        revisionCount = mockFilter<any>('mock_revision_queue', user.id).filter(r => !r.completed).length
        recentQuestions = questions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      } else {
        const [qRes, qaRes, bRes, nRes, rRes] = await Promise.all([
          supabase.from('questions').select('*').eq('user_id', user.id),
          supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
          supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('revision_queue').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', false),
        ])
        questions = (qRes.data || []) as Question[]
        quizAttempts = qaRes.data || []
        bookmarksCount = bRes.count || 0
        notesCount = nRes.count || 0
        revisionCount = rRes.count || 0
        recentQuestions = [...questions]
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
        user_id: user.id,
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
      const { data: inserted, error } = await supabase
        .from('questions')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return inserted as Question
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
      const payload = { user_id: user.id, ...data, created_at: ts() }
      if (IS_MOCK_MODE) {
        const id = crypto.randomUUID()
        const item = { id, ...payload }
        const existing = mockGet<any>('mock_quiz_attempts')
        mockSet('mock_quiz_attempts', [item, ...existing])
        return item as QuizAttempt
      }
      const { data: inserted, error } = await supabase
        .from('quiz_attempts')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return inserted as QuizAttempt
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
        const existing = all.find((b: any) => b.user_id === user.id && b.question_id === questionId)
        if (existing) {
          mockSet('mock_bookmarks', all.filter((b: any) => b.id !== existing.id))
          return { action: 'removed' }
        }
        mockSet('mock_bookmarks', [{ id: crypto.randomUUID(), user_id: user.id, question_id: questionId, bookmark_type: type, created_at: ts() }, ...all])
        return { action: 'added' }
      }
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single()

      if (existing) {
        await supabase.from('bookmarks').delete().eq('id', existing.id)
        return { action: 'removed' }
      }
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        question_id: questionId,
        bookmark_type: type,
        created_at: ts(),
      })
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
      const payload = { user_id: user.id, ...data, created_at: now, updated_at: now }
      if (IS_MOCK_MODE) {
        const id = crypto.randomUUID()
        const item = { id, ...payload }
        mockSet('mock_notes', [item, ...mockGet('mock_notes')])
        return item as Note
      }
      const { data: inserted, error } = await supabase
        .from('notes')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return inserted as Note
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
      const { error } = await supabase.from('notes').delete().eq('id', noteId)
      if (error) throw error
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
        const existing = all.find((r: any) => r.user_id === user.id && r.question_id === questionId)
        if (existing) {
          mockSet('mock_revision_queue', all.map((r: any) => r.id === existing.id ? { ...r, priority, completed: false } : r))
        } else {
          mockSet('mock_revision_queue', [...all, { id: crypto.randomUUID(), user_id: user.id, question_id: questionId, priority, completed: false, created_at: ts() }])
        }
        return
      }
      const { data: existing } = await supabase
        .from('revision_queue')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single()

      if (existing) {
        await supabase.from('revision_queue').update({ priority, completed: false }).eq('id', existing.id)
      } else {
        await supabase.from('revision_queue').insert({
          user_id: user.id,
          question_id: questionId,
          priority,
          completed: false,
          created_at: ts(),
        })
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
        const profiles = mockGet<any>('mock_supabase_profiles')
        const newXP = (profile?.xp || 0) + amount
        const levelData = calculateLevel(newXP)
        mockSet('mock_supabase_profiles', profiles.map((p: any) =>
          p.id === user.id ? { ...p, xp: newXP, level: levelData.level } : p
        ))
        mockSet('mock_xp_history', [
          { id: crypto.randomUUID(), user_id: user.id, xp_amount: amount, action, description, created_at: ts() },
          ...mockGet('mock_xp_history'),
        ])
        return
      }
      await supabase.from('xp_history').insert({
        user_id: user.id,
        xp_amount: amount,
        action,
        description: description || null,
        created_at: ts(),
      })
      const newXP = (profile?.xp || 0) + amount
      const levelData = calculateLevel(newXP)
      await supabase
        .from('profiles')
        .update({ xp: newXP, level: levelData.level, last_active: ts() })
        .eq('id', user.id)
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
        const all = mockGet<any>('mock_user_subjects').filter((s: any) => s.user_id !== user.id)
        mockSet('mock_user_subjects', [...all, ...subjects.map(subject => ({ id: crypto.randomUUID(), user_id: user.id, subject, created_at: ts() }))])
        return
      }
      // Delete existing then insert new
      await supabase.from('user_subjects').delete().eq('user_id', user.id)
      if (subjects.length > 0) {
        await supabase.from('user_subjects').insert(
          subjects.map(subject => ({ user_id: user.id, subject, created_at: ts() }))
        )
      }
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
        mockSet('mock_supabase_profiles', profiles.map((p: any) => p.id === user.id ? { ...p, ...payload } : p))
        return
      }
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
