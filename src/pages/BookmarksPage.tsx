import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Search, Trash2, Clock, BookOpen, ExternalLink } from 'lucide-react'
import { useBookmarks, useToggleBookmark } from '@/hooks/useData'
import { getSubjectIcon, getSubjectColor, formatRelativeTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'

export function BookmarksPage() {
  const navigate = useNavigate()
  const { data: bookmarks, isLoading } = useBookmarks()
  const toggleBookmark = useToggleBookmark()
  const [search, setSearch] = useState('')

  const filteredBookmarks = bookmarks?.filter(b => 
    b.questions?.question.toLowerCase().includes(search.toLowerCase()) ||
    b.questions?.subject.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = async (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation()
    try {
      await toggleBookmark.mutateAsync({ questionId })
      toast({ title: 'Bookmark removed', variant: 'success' })
    } catch (error) {
      toast({ title: 'Failed to remove bookmark', variant: 'error' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Bookmark className="h-6 w-6" />
            </div>
            Bookmarks
          </h1>
          <p className="text-muted-foreground mt-2">
            Your saved explanations and concepts for quick access
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your bookmarks..."
            className="pl-9 bg-background/50 border-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 h-40">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filteredBookmarks?.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "No bookmarks match your search" : "Save important explanations to find them here easily"}
            </p>
            {!search && (
              <Button onClick={() => navigate('/history')}>Browse History</Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredBookmarks?.map((bookmark, i) => {
              if (!bookmark.questions) return null
              
              return (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/session/${bookmark.question_id}`)}
                  className="glass-card p-5 hover:border-primary/40 hover:bg-card transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getSubjectColor(bookmark.questions.subject)} opacity-5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2`} />
                  
                  <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getSubjectColor(bookmark.questions.subject)} text-white shadow-sm`}>
                        {bookmark.questions.subject}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(bookmark.created_at)}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => handleRemove(e, bookmark.question_id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 relative z-10">
                    {bookmark.questions.question}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 relative z-10">
                    {bookmark.questions.answer.substring(0, 120)}...
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary mt-auto relative z-10 group-hover:translate-x-1 transition-transform w-fit">
                    View Explanation <ExternalLink className="h-3 w-3" />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
