import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase, IS_MOCK_MODE } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      if (IS_MOCK_MODE) {
        const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]')
        if (users.find((u: any) => u.email === data.email)) {
          throw new Error('Email already in use')
        }
        const id = crypto.randomUUID()
        const newUser = { id, email: data.email, password: data.password, user_metadata: { full_name: data.name } }
        localStorage.setItem('mock_supabase_users', JSON.stringify([...users, newUser]))
        const profile = {
          id, email: data.email, full_name: data.name,
          xp: 0, level: 1, streak: 0, longest_streak: 0,
          theme: 'dark', onboarding_completed: false,
          notifications_enabled: true,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }
        const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]')
        localStorage.setItem('mock_supabase_profiles', JSON.stringify([...profiles, profile]))
        localStorage.setItem('mock_supabase_session', JSON.stringify({ user: newUser, access_token: 'mock-token' }))
        toast({ title: 'Account created! 🎉', description: 'Welcome to Clarifier AI!', variant: 'success' })
        navigate('/onboarding')
        return
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.name },
        },
      })
      if (error) throw error
      toast({ title: 'Account created! 🎉', description: 'Welcome to Clarifier AI!', variant: 'success' })
      navigate('/onboarding')
    } catch (error: any) {
      const msg = error.message || 'Signup failed'
      if (msg.includes('already registered') || msg.includes('email-already-in-use') || msg.includes('User already registered')) {
        toast({ title: 'Email already in use', description: 'Try logging in instead.', variant: 'error' })
      } else {
        toast({ title: msg, variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f172a 100%)' }} />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="w-20 h-20 rounded-3xl brand-gradient flex items-center justify-center shadow-2xl glow mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-3 gradient-text">Join Clarifier AI</h1>
          <p className="text-xl text-center text-white/70 mb-8">Your AI-powered learning companion</p>
          <div className="space-y-3 w-full max-w-sm">
            {[
              '✅ Free to get started — no credit card needed',
              '🤖 Powered by Groq AI (llama-3.3-70b)',
              '📚 35+ subjects covered',
              '🎯 Adaptive quiz generation',
              '📊 Detailed performance analytics',
              '🔥 Gamification & achievements',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-white/80 text-sm p-2 rounded-lg bg-white/5">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
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
            <h2 className="text-2xl font-bold">Create your account</h2>
          </div>
          <p className="text-muted-foreground mb-8">Start your personalized learning journey today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('name')} placeholder="John Doe" className="pl-9 h-11" autoComplete="name" />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('email')} type="email" placeholder="you@example.com" className="pl-9 h-11" autoComplete="email" />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="pl-9 pr-10 h-11" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" className="pl-9 pr-10 h-11" autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="gradient" className="w-full h-11 text-base font-semibold" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
