import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useAuth } from './contexts/AuthContext'
import { Toaster } from './components/ui/toast'
import { Loader2 } from 'lucide-react'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { OnboardingPage } from './pages/OnboardingPage'

// Main Pages
import { DashboardPage } from './pages/DashboardPage'
import { DoubtSolverPage } from './pages/DoubtSolverPage'
import { SessionPage } from './pages/SessionPage'
import { HistoryPage } from './pages/HistoryPage'
import { BookmarksPage } from './pages/BookmarksPage'
import { NotesPage } from './pages/NotesPage'
import { RevisionPage } from './pages/RevisionPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, requireOnboarding = true }: { children: React.ReactNode, requireOnboarding?: boolean }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (user) {
    if (profile && !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* Email verification — accessible without being logged in */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Password reset — Supabase redirects here after clicking reset link */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Onboarding — requires login but NOT completed onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ask" element={<DoubtSolverPage />} />
          <Route path="/session/:id" element={<SessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/revision" element={<RevisionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
