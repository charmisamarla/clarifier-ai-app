import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Question, QuizAttempt, Bookmark, Note, RevisionQueue, DashboardStats } from '@/types/database'
import { calculateLevel } from '@/lib/utils'

export function useUserSubjects() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['user-subjects', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data?.map(s => s.subject) || []
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
      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (filters?.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }
      if (filters?.search) {
        query = query.ilike('question', `%${filters.search}%`)
      }
      
      const { data, error } = await query.limit(50)
      if (error) throw error
      return (data || []) as Question[]
    },
    enabled: !!user,
  })
}

export function useQuestion(id: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (error) throw error
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
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (questionId) {
        query = query.eq('question_id', questionId)
      }
      
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
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (filters?.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }
      if (filters?.noteType && filters.noteType !== 'all') {
        query = query.eq('note_type', filters.noteType)
      }
      
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
      
      // Fetch questions
      const { data: questions } = await supabase
        .from('questions')
        .select('id, subject, created_at, question')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Fetch quiz attempts
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('score, percentage, created_at')
        .eq('user_id', user.id)
      
      // Fetch bookmarks count
      const { count: bookmarksCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      // Fetch notes count
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      // Fetch revision queue count
      const { count: revisionCount } = await supabase
        .from('revision_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', false)
      
      // Fetch recent questions
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      const totalQuestions = questions?.length || 0
      const totalQuizzes = quizAttempts?.length || 0
      const averageScore = totalQuizzes > 0
        ? Math.round(quizAttempts!.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
        : 0

      // Calculate subject progress
      const subjectMap: Record<string, { count: number; scores: number[] }> = {}
      questions?.forEach(q => {
        if (!subjectMap[q.subject]) subjectMap[q.subject] = { count: 0, scores: [] }
        subjectMap[q.subject].count++
      })

      const subjectProgress = Object.entries(subjectMap).map(([subject, data]) => ({
        subject,
        questionsAsked: data.count,
        quizzesCompleted: 0,
        averageScore: 0,
        lastStudied: null,
      }))

      // Weekly activity (last 7 days)
      const today = new Date()
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - (6 - i))
        const dateStr = date.toISOString().split('T')[0]
        const count = questions?.filter(q => q.created_at.startsWith(dateStr)).length || 0
        return {
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
          count,
        }
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
        bookmarksCount: bookmarksCount || 0,
        notesCount: notesCount || 0,
        revisionQueueCount: revisionCount || 0,
        subjectProgress,
        recentActivity: (recentQuestions || []) as Question[],
        weeklyActivity,
      }
    },
    enabled: !!user,
  })
}

// Mutations
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
      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          ...data,
          follow_up_questions: data.follow_up_questions || null,
        })
        .select()
        .single()
      if (error) throw error
      return question as Question
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
      const { data: attempt, error } = await supabase
        .from('quiz_attempts')
        .insert({ user_id: user.id, ...data })
        .select()
        .single()
      if (error) throw error
      return attempt as QuizAttempt
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
      
      // Check if bookmark exists
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single()
      
      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existing.id)
        if (error) throw error
        return { action: 'removed' }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, question_id: questionId, bookmark_type: type })
        if (error) throw error
        return { action: 'added' }
      }
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
      const { data: note, error } = await supabase
        .from('notes')
        .insert({ user_id: user.id, ...data })
        .select()
        .single()
      if (error) throw error
      return note as Note
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
      const { error } = await supabase
        .from('revision_queue')
        .upsert({
          user_id: user.id,
          question_id: questionId,
          priority,
          completed: false,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-queue'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useAwardXP() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()
  
  return useMutation({
    mutationFn: async ({ action, amount, description }: { action: string; amount: number; description?: string }) => {
      if (!user) throw new Error('Not authenticated')
      
      // Add XP history entry
      await supabase.from('xp_history').insert({
        user_id: user.id,
        xp_amount: amount,
        action,
        description,
      })
      
      // Update profile XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .single()
      
      const newXP = (profile?.xp || 0) + amount
      const levelData = calculateLevel(newXP)
      
      await supabase.from('profiles').update({
        xp: newXP,
        level: levelData.level,
        last_active: new Date().toISOString(),
      }).eq('id', user.id)
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
      
      // Delete existing
      await supabase.from('user_subjects').delete().eq('user_id', user.id)
      
      // Insert new
      if (subjects.length > 0) {
        const { error } = await supabase.from('user_subjects').insert(
          subjects.map(subject => ({ user_id: user.id, subject }))
        )
        if (error) throw error
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
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
