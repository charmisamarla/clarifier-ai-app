import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [codeValid, setCodeValid] = useState<boolean | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!oobCode) {
      setCodeValid(false)
      return
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setCodeValid(true))
      .catch(() => setCodeValid(false))
  }, [oobCode])

  const onSubmit = async (data: FormData) => {
    if (!oobCode) return
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, data.password)
      setDone(true)
      toast({ title: 'Password updated!', description: 'You can now sign in with your new password.', variant: 'success' })
      setTimeout(() => navigate('/login'), 2500)
    } catch (error: any) {
      toast({ title: error.message || 'Failed to update password', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Clarifier AI</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password updated!</h2>
              <p className="text-muted-foreground">Redirecting you to login...</p>
            </div>
          ) : codeValid === false ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Link expired</h2>
              <p className="text-muted-foreground mb-6">
                This password reset link has expired or is invalid. Please request a new one.
              </p>
              <Button variant="gradient" className="w-full h-11" onClick={() => navigate('/forgot-password')}>
                Request New Reset Link
              </Button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Set new password</h2>
              <p className="text-muted-foreground text-center mb-8">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      className="pl-9 pr-10 h-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="pl-9 pr-10 h-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 font-semibold"
                  loading={loading}
                  disabled={codeValid !== true || loading}
                >
                  {codeValid === null ? 'Verifying link...' : 'Update Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
