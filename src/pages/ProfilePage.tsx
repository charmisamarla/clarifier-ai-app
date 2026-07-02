import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Award, Flame, Zap, Shield, Crown, Star, BrainCircuit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats } from '@/hooks/useData'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePage() {
  const { user, profile } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  // Calculate next level XP requirement
  const currentLevel = profile?.level || 1
  const currentXP = profile?.xp || 0
  const nextLevelXP = currentLevel * 1000 // Simple formula: level * 1000 XP to reach next
  const xpProgress = Math.min(100, (currentXP / nextLevelXP) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Profile Header */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full brand-gradient flex items-center justify-center text-3xl font-bold text-white shadow-xl glow border-4 border-background">
            {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h1 className="text-3xl font-bold">{profile?.full_name || 'Learner'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-medium">
                <Crown className="h-4 w-4" />
                Level {currentLevel}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm font-medium">
                <Flame className="h-4 w-4" />
                {profile?.streak || 0} Day Streak
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium">
                <Award className="h-4 w-4" />
                {stats?.totalQuestions || 0} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Level Progress
            </h3>
            <p className="text-sm text-muted-foreground">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP to Level {currentLevel + 1}</p>
          </div>
          <span className="font-bold text-amber-500">{Math.round(xpProgress)}%</span>
        </div>
        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden mt-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* Badges / Achievements (Mock Data) */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          Recent Badges
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 1, name: 'First Question', desc: 'Asked your first doubt', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10', unlocked: true },
            { id: 2, name: 'Quiz Master', desc: 'Scored 100% on a quiz', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', unlocked: true },
            { id: 3, name: '3-Day Streak', desc: 'Learned for 3 days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', unlocked: (profile?.streak || 0) >= 3 },
            { id: 4, name: '10 Questions', desc: 'Asked 10 doubts', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-500/10', unlocked: (stats?.totalQuestions || 0) >= 10 },
          ].map(badge => (
            <div key={badge.id} className={`p-4 rounded-xl border text-center transition-all ${badge.unlocked ? 'border-border bg-card' : 'border-dashed border-border/50 bg-card/20 opacity-50 grayscale'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${badge.unlocked ? badge.bg : 'bg-muted text-muted-foreground'}`}>
                <badge.icon className={`h-6 w-6 ${badge.unlocked ? badge.color : ''}`} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
              <p className="text-xs text-muted-foreground leading-tight">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
