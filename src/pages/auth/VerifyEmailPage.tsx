import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react'
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || auth.currentUser?.email || 'your email address'
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Listen for email verification in another tab
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate('/onboarding')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResendLoading(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found. Please sign up again.')
      await sendEmailVerification(user)
      setSent(true)
      setResendCooldown(60)
      toast({ title: 'Verification email sent!', description: 'Check your inbox.', variant: 'success' })
    } catch (error: any) {
      toast({ title: error.message || 'Failed to resend email', variant: 'error' })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Clarifier AI</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Check your email</h2>
          <p className="text-muted-foreground text-center mb-6 leading-relaxed">
            We've sent a verification link to{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Click the link in the email to activate your account.
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {[
              { step: '1', text: 'Open your email inbox' },
              { step: '2', text: 'Find the email from Clarifier AI' },
              { step: '3', text: 'Click "Verify email"' },
              { step: '4', text: "You'll be redirected automatically" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">{step}</span>
                </div>
                <span className="text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {sent && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Verification email resent successfully!</span>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={handleResend}
            loading={resendLoading}
            disabled={resendLoading || resendCooldown > 0}
          >
            <RefreshCw className="h-4 w-4" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </Button>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Didn't receive it? Check your spam folder or try a different email address.
        </p>
      </motion.div>
    </div>
  )
}
