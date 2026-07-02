import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, IS_MOCK_MODE } from '@/lib/firebase'
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
async function fetchProfileFromFirestore(userId: string): Promise<Profile | null> {
  try {
    const snap = await getDoc(doc(db, 'profiles', userId))
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Profile
    }
    return null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

async function createOrUpdateProfile(user: User) {
  try {
    const profileRef = doc(db, 'profiles', user.uid)
    const snap = await getDoc(profileRef)

    if (!snap.exists()) {
      // First login — create profile
      await setDoc(profileRef, {
        id: user.uid,
        email: user.email || '',
        full_name: user.displayName || null,
        avatar_url: user.photoURL || null,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        last_active: new Date().toISOString(),
        theme: 'dark',
        onboarding_completed: false,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile)
    } else {
      await updateDoc(profileRef, {
        email: user.email || snap.data()?.email || '',
        full_name: user.displayName || snap.data()?.full_name || null,
        avatar_url: user.photoURL || snap.data()?.avatar_url || null,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
    return {
      uid: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.full_name || null,
      photoURL: session.user.user_metadata?.avatar_url || null,
      emailVerified: true,
      metadata: {},
      providerData: [],
      refreshToken: 'mock-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      isAnonymous: false,
      providerId: 'password',
    } as unknown as User
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
      p = await fetchProfileFromFirestore(userId)
    }
    setProfile(p)
    applyTheme(p?.theme)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid)
  }

  const signOut = async () => {
    if (IS_MOCK_MODE) {
      localStorage.removeItem('mock_supabase_session')
    } else {
      await firebaseSignOut(auth)
    }
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    if (IS_MOCK_MODE) {
      const mockUser = getMockUser()
      setUser(mockUser)
      if (mockUser) fetchProfile(mockUser.uid)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await createOrUpdateProfile(firebaseUser)
        await fetchProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
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
