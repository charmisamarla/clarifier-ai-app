import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, BookOpen, BrainCircuit, Check, X, ArrowRight, Play } from 'lucide-react'
import { useRevisionQueue, useAwardXP } from '@/hooks/useData'
import { getSubjectIcon, getSubjectColor, formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export function RevisionPage() {
  const navigate = useNavigate()
  const { data: queue, isLoading, refetch } = useRevisionQueue()
  const awardXP = useAwardXP()
  
  const [activeSession, setActiveSession] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  
  const currentItem = queue?.[currentIndex]

  const handleStartSession = () => {
    if (!queue || queue.length === 0) return
    setActiveSession(true)
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionCompleted(false)
  }

  const handleNext = async (remembered: boolean) => {
    if (!currentItem) return
    
    try {
      // If remembered well, mark as completed
      if (remembered) {
        await supabase.from('revision_queue').update({ completed: true }).eq('id', currentItem.id)
      } else {
        await supabase.from('revision_queue').update({
          priority: Math.max(1, (currentItem.priority || 1) - 1),
        }).eq('id', currentItem.id)
      }
      
      // Move to next
      if (queue && currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        // Session complete
        setSessionCompleted(true)
        awardXP.mutate({ action: 'complete_revision', amount: 20, description: 'Completed a revision session' })
        toast({ title: 'Revision session complete! 🎉', variant: 'success' })
        refetch()
      }
    } catch (error) {
      toast({ title: 'Error updating item', variant: 'error' })
    }
  }

  if (activeSession && currentItem && !sessionCompleted) {
    return (
      <div className="max-w-3xl mx-auto min-h-[calc(100vh-120px)] flex flex-col justify-center pb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Card {currentIndex + 1} of {queue.length}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveSession(false)}>
            End Session
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(currentIndex / queue.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (showAnswer ? '-answer' : '-question')}
            initial={{ opacity: 0, y: 20, rotateX: showAnswer ? -90 : 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: showAnswer ? 90 : -90 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 min-h-[400px] flex flex-col relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${getSubjectColor(currentItem.questions?.subject || '')}`} />
            
            <div className="flex items-center gap-2 mb-6">
              <span className="badge-primary">{currentItem.questions?.subject}</span>
            </div>

            {!showAnswer ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <HelpCircle className="h-12 w-12 text-primary/20 mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {currentItem.questions?.question}
                </h2>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border">
                  {currentItem.questions?.question}
                </h2>
                <div className="markdown-content flex-1 overflow-y-auto pr-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {currentItem.questions?.answer.substring(0, 800) + (currentItem.questions!.answer.length > 800 ? '...\n\n*(Explanation truncated for flashcard)*' : '')}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-8 flex justify-center">
          {!showAnswer ? (
            <Button size="lg" className="w-full max-w-sm" onClick={() => setShowAnswer(true)}>
              Show Answer
            </Button>
          ) : (
            <div className="flex gap-4 w-full max-w-md">
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                onClick={() => handleNext(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Need Review
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => handleNext(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                Got It
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (sessionCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-12 w-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Great job reviewing your pending topics. Spaced repetition is key to long-term memory.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setActiveSession(false)}>
            Back to Queue
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <RefreshCw className="h-6 w-6" />
            </div>
            Revision Queue
          </h1>
          <p className="text-muted-foreground mt-2">
            Topics you need to review based on your quiz performance
          </p>
        </div>
        
        {queue && queue.length > 0 && (
          <Button variant="gradient" size="lg" className="gap-2" onClick={handleStartSession}>
            <Play className="h-4 w-4" />
            Start Review Session
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : queue?.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium mb-1">Queue is empty!</h3>
          <p className="text-muted-foreground mb-4">
            You're all caught up on your revisions. 
          </p>
          <Button onClick={() => navigate('/ask')}>Learn Something New</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queue?.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getSubjectColor(item.questions?.subject || '')}`} />
              
              <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center gap-1">
                    {getSubjectIcon(item.questions?.subject || '')} {item.questions?.subject}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Added {formatRelativeTime(item.created_at)}
                  </span>
                  {item.priority > 1 && (
                    <span className="text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full font-medium">
                      High Priority
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-foreground line-clamp-1 mb-1">
                  {item.questions?.question}
                </h3>
              </div>
              
              <div className="shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate(`/session/${item.question_id}`)} className="gap-1">
                  View full topic <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Need a HelpCircle component since it was missed in lucide imports above
function HelpCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}
