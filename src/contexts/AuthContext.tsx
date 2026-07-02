import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, IS_MOCK_MODE } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

// ─── Profile helpers ──────────────────────────────────────────────────────────
async function fetchProfileFromSupabase(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data as Profile
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

async function createOrUpdateProfile(user: User) {
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    const now = new Date().toISOString()
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null
    const avatarUrl = user.user_metadata?.avatar_url || null

    if (!existing) {
      // First login — create profile
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        full_name: fullName,
        avatar_url: avatarUrl,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        last_active: now,
        theme: 'dark',
        onboarding_completed: false,
        notifications_enabled: true,
        created_at: now,
        updated_at: now,
      })
    } else {
      await supabase
        .from('profiles')
        .update({
          email: user.email || '',
          full_name: fullName,
          avatar_url: avatarUrl,
          last_active: now,
          updated_at: now,
        })
        .eq('id', user.id)
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error)
  }
}

function applyTheme(theme: string | undefined) {
  if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
  }
}

// ─── Mock auth helpers ────────────────────────────────────────────────────────
function getMockUser(): User | null {
  try {
    const session = JSON.parse(localStorage.getItem('mock_supabase_session') || 'null')
    if (!session?.user) return null
    return session.user as User
  } catch {
    return null
  }
}

function getMockProfile(userId: string): Profile | null {
  try {
    const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]')
    return profiles.find((p: Profile) => p.id === userId) || null
  } catch {
    return null
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    let p: Profile | null = null
    if (IS_MOCK_MODE) {
      p = getMockProfile(userId)
    } else {
      p = await fetchProfileFromSupabase(userId)
    }
    setProfile(p)
    applyTheme(p?.theme)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const signOut = async () => {
    if (IS_MOCK_MODE) {
      localStorage.removeItem('mock_supabase_session')
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    if (IS_MOCK_MODE) {
      const mockUser = getMockUser()
      setUser(mockUser)
      if (mockUser) fetchProfile(mockUser.id)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const supabaseUser = session?.user ?? null
      setUser(supabaseUser)
      if (supabaseUser) {
        await createOrUpdateProfile(supabaseUser)
        await fetchProfile(supabaseUser.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const supabaseUser = session?.user ?? null
      setUser(supabaseUser)
      if (supabaseUser) {
        await createOrUpdateProfile(supabaseUser)
        await fetchProfile(supabaseUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
