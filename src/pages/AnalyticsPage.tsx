import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, BrainCircuit, Activity, Zap, Award } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getSubjectIcon, getSubjectColor } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnalyticsPage() {
  const { profile } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()
  const [timeRange, setTimeRange] = useState('all')

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  // Calculate mastery distribution
  const expertCount = stats?.subjectProgress.filter(s => s.questionsAsked >= 10).length || 0
  const proficientCount = stats?.subjectProgress.filter(s => s.questionsAsked >= 5 && s.questionsAsked < 10).length || 0
  const learningCount = stats?.subjectProgress.filter(s => s.questionsAsked < 5).length || 0
  const totalSubjects = stats?.subjectProgress.length || 1

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            Analytics & Progress
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed insights into your learning journey
          </p>
        </div>
        <div className="w-40">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Average Score', 
            value: `${stats?.averageScore || 0}%`, 
            sub: 'Across all quizzes',
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
          },
          { 
            label: 'Learning Streak', 
            value: `${profile?.streak || 0} Days`, 
            sub: `Best: ${profile?.longest_streak || 0}`,
            icon: Zap,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
          },
          { 
            label: 'Total XP', 
            value: profile?.xp?.toLocaleString() || '0', 
            sub: `Level ${profile?.level || 1}`,
            icon: Award,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
          },
          { 
            label: 'Questions Asked', 
            value: stats?.totalQuestions || 0, 
            sub: 'Total interactions',
            icon: BrainCircuit,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            Subject Mastery
          </h2>
          
          <div className="space-y-5">
            {stats?.subjectProgress && stats.subjectProgress.length > 0 ? (
              stats.subjectProgress.slice(0, 5).map((subject, i) => {
                const percentage = Math.min(100, (subject.questionsAsked / 20) * 100) // Assuming 20 Qs is "mastery" for this bar
                return (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <span>{getSubjectIcon(subject.subject)}</span>
                        {subject.subject}
                      </div>
                      <span className="text-muted-foreground">{subject.questionsAsked} topics</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${getSubjectColor(subject.subject)}`}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">Not enough data to show subject mastery.</p>
            )}
          </div>
        </div>

        {/* Mastery Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-primary" />
            Mastery Distribution
          </h2>
          
          {stats?.subjectProgress && stats.subjectProgress.length > 0 ? (
            <div className="flex flex-col justify-center h-[280px]">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      Expert (10+ topics)
                    </span>
                    <span className="text-sm text-muted-foreground">{expertCount} subjects</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(expertCount / totalSubjects) * 100}%` }} className="h-full bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      Proficient (5-9 topics)
                    </span>
                    <span className="text-sm text-muted-foreground">{proficientCount} subjects</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(proficientCount / totalSubjects) * 100}%` }} className="h-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Learning (1-4 topics)
                    </span>
                    <span className="text-sm text-muted-foreground">{learningCount} subjects</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(learningCount / totalSubjects) * 100}%` }} className="h-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-8 h-[280px] flex items-center justify-center">Start asking questions to see your mastery distribution.</p>
          )}
        </div>
      </div>
    </div>
  )
}
