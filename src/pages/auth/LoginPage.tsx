import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase, IS_MOCK_MODE } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      if (IS_MOCK_MODE) {
        // Mock login
        const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]')
        const user = users.find((u: any) => u.email === data.email && u.password === data.password)
        if (!user) throw new Error('Invalid email or password')
        const session = { user, access_token: 'mock-token' }
        localStorage.setItem('mock_supabase_session', JSON.stringify(session))
        navigate('/dashboard')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      navigate('/dashboard')
    } catch (error: any) {
      const msg = error.message || 'Login failed'
      if (
        msg.includes('Invalid login credentials') ||
        msg.includes('invalid_credentials') ||
        msg.includes('user-not-found') ||
        msg.includes('wrong-password')
      ) {
        toast({ title: 'Invalid email or password', variant: 'error' })
      } else {
        toast({ title: msg, variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f172a 100%)' }} />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 rounded-3xl brand-gradient flex items-center justify-center shadow-2xl glow mb-6 mx-auto">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">
              <span className="gradient-text">Clarifier AI</span>
            </h1>
            <p className="text-xl text-white/70">Learn. Understand. Practice. Master.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            {[
              { icon: '🤖', title: 'AI-Powered Explanations', desc: 'Get concepts explained in multiple ways' },
              { icon: '📝', title: 'Auto Quiz Generation', desc: 'Practice with adaptive quizzes' },
              { icon: '📊', title: 'Performance Analytics', desc: 'Track your learning progress' },
              { icon: '🔥', title: 'Gamified Learning', desc: 'Earn XP, badges, and maintain streaks' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">Clarifier AI</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Welcome back</h2>
          </div>
          <p className="text-muted-foreground mb-8">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 h-11"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-11"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-base font-semibold"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
