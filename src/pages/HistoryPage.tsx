import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, History as HistoryIcon, Filter, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { useQuestions, useUserSubjects } from '@/hooks/useData'
import { getSubjectIcon, getSubjectColor, formatRelativeTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ALL_SUBJECTS } from '@/lib/constants'

export function HistoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  
  const [search, setSearch] = useState(initialSearch)
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  
  const { data: userSubjects } = useUserSubjects()
  const { data: history, isLoading } = useQuestions({ subject: subjectFilter, search })

  const availableSubjects = userSubjects && userSubjects.length > 0 ? userSubjects : ALL_SUBJECTS

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <HistoryIcon className="h-6 w-6" />
            </div>
            Learning History
          </h1>
          <p className="text-muted-foreground mt-2">
            Review your past questions and concepts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-9 bg-background/50"
          />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="bg-background/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Subjects" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : history?.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No history found</h3>
            <p className="text-muted-foreground">
              {search || subjectFilter !== 'all' 
                ? "Try adjusting your filters" 
                : "You haven't asked any questions yet"}
            </p>
          </div>
        ) : (
          history?.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/session/${item.id}`)}
              className="glass-card p-5 hover:border-primary/40 hover:bg-card transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${getSubjectColor(item.subject)} bg-opacity-10 shadow-inner hidden sm:flex`}>
                {getSubjectIcon(item.subject)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getSubjectColor(item.subject)} text-white`}>
                    {item.subject}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize border border-border px-2 py-0.5 rounded-full">
                    {item.mode} Mode
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {item.question}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.answer.substring(0, 150)}...
                </p>
              </div>
              
              <div className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all self-end sm:self-center mt-2 sm:mt-0">
                <ChevronRight className="h-5 w-5" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
