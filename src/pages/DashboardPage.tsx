import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, Flame, BookOpen, Trophy, Target, ArrowRight,
  TrendingUp, Clock, Calendar, CheckCircle2,
  Sparkles, RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats } from '@/hooks/useData'
import { getGreeting, getSubjectIcon, getSubjectColor, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { data: stats, isLoading } = useDashboardStats()

  const greeting = getGreeting()
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Learner'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl brand-gradient text-white p-8 sm:p-10 shadow-lg glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-white/80 max-w-xl">
              Ready to learn something new today? You're on a {profile?.streak || 0}-day streak. 
              Keep it up!
            </p>
          </div>
          
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => navigate('/ask')}
            className="bg-white text-brand-600 hover:bg-white/90 gap-2 shrink-0 border-0"
          >
            <Sparkles className="h-4 w-4" />
            Ask a Doubt
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Learning Streak', 
            value: `${profile?.streak || 0} Days`, 
            subtitle: `Best: ${profile?.longest_streak || 0}`,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
          },
          { 
            title: 'Total XP', 
            value: profile?.xp?.toLocaleString() || '0', 
            subtitle: `Level ${profile?.level || 1}`,
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
          },
          { 
            title: 'Questions Asked', 
            value: stats?.totalQuestions || 0, 
            subtitle: 'Across all subjects',
            icon: BookOpen,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
          { 
            title: 'Avg. Accuracy', 
            value: `${stats?.averageScore || 0}%`, 
            subtitle: `${stats?.totalQuizzes || 0} quizzes taken`,
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card flex items-start gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1 mb-0.5">{stat.value}</h3>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Continue Learning
              </h2>
              <Link to="/history" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/session/${activity.id}`)}
                    className="p-4 rounded-xl border border-border bg-card/50 hover:bg-accent hover:border-primary/30 transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 sm:items-center"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${getSubjectColor(activity.subject)} bg-opacity-10 shadow-inner`}>
                      {getSubjectIcon(activity.subject)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          {activity.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {activity.question}
                      </h3>
                    </div>
                    <div className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No learning history yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Ask your first question to start learning</p>
                <Button onClick={() => navigate('/ask')}>Ask a Doubt</Button>
              </div>
            )}
          </div>

          {/* Subject Progress */}
          {stats?.subjectProgress && stats.subjectProgress.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                Subject Progress
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.subjectProgress.slice(0, 4).map((subject, i) => (
                  <div key={subject.subject} className="p-4 rounded-xl border border-border bg-card/30">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getSubjectIcon(subject.subject)}</span>
                      <h3 className="font-semibold text-sm flex-1 truncate">{subject.subject}</h3>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>{subject.questionsAsked} topics</span>
                      <span>Level {Math.min(10, Math.floor(subject.questionsAsked / 5) + 1)}</span>
                    </div>
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getSubjectColor(subject.subject)}`}
                        style={{ width: `${Math.min(100, (subject.questionsAsked % 5) * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Goal */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Goal
            </h2>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stats?.recentActivity?.filter(a => a.created_at.startsWith(new Date().toISOString().split('T')[0])).length ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Learn a new concept</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Take a practice quiz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Queue */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-500" />
                Need Revision
              </h2>
              {stats?.revisionQueueCount ? (
                <span className="badge-warning">{stats.revisionQueueCount} pending</span>
              ) : null}
            </div>
            
            {stats?.revisionQueueCount ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  You have topics that need your attention. Let's strengthen your weak areas!
                </p>
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10" onClick={() => navigate('/revision')}>
                  Start Revision Session
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-emerald-500">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending revisions today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
