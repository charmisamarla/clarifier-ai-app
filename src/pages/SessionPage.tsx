import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  BookOpen, BrainCircuit, GraduationCap, ChevronRight, 
  ArrowLeft, Bookmark, BookmarkCheck, FileText, 
  HelpCircle, Share2, Loader2, Sparkles, AlertCircle
} from 'lucide-react'
import { useQuestion, useToggleBookmark, useSaveQuizAttempt, useAwardXP, useBookmarks, useSaveNote } from '@/hooks/useData'
import { generateQuiz, generateNotes, parseQuizFromJSON } from '@/lib/groq'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'
import type { QuizData } from '@/types/database'

export function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: question, isLoading, error } = useQuestion(id || '')
  const { data: bookmarks } = useBookmarks()
  
  const toggleBookmark = useToggleBookmark()
  const saveQuizAttempt = useSaveQuizAttempt()
  const saveNote = useSaveNote()
  const awardXP = useAwardXP()

  const [activeTab, setActiveTab] = useState('explanation')
  
  // Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)

  // Notes State
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null)

  const isBookmarked = bookmarks?.some(b => b.question_id === id)

  useEffect(() => {
    if (error) {
      toast({ title: 'Error loading session', variant: 'error' })
      navigate('/dashboard')
    }
  }, [error, navigate])

  const handleToggleBookmark = async () => {
    if (!id) return
    try {
      const result = await toggleBookmark.mutateAsync({ questionId: id })
      toast({ 
        title: result.action === 'added' ? 'Saved to bookmarks' : 'Removed from bookmarks',
        variant: 'success'
      })
      if (result.action === 'added') {
        awardXP.mutate({ action: 'bookmark', amount: 5, description: 'Bookmarked a question' })
      }
    } catch (error) {
      toast({ title: 'Failed to update bookmark', variant: 'error' })
    }
  }

  const handleGenerateQuiz = async () => {
    if (!question) return
    setIsGeneratingQuiz(true)
    try {
      const jsonStr = await generateQuiz(question.question, question.answer, question.subject)
      const parsed = parseQuizFromJSON(jsonStr)
      if (parsed) {
        setQuizData(parsed)
        setActiveTab('practice')
        toast({ title: 'Quiz generated!', variant: 'success' })
      } else {
        throw new Error('Failed to parse quiz data')
      }
    } catch (error) {
      toast({ title: 'Failed to generate quiz', description: 'Please try again', variant: 'error' })
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const handleQuizSubmit = async () => {
    if (!quizData || !question) return
    
    // Calculate basic score for MCQ and True/False
    let score = 0
    let maxScore = quizData.mcq.length + quizData.trueFalse.length
    
    quizData.mcq.forEach(q => {
      if (quizAnswers[`mcq_${q.id}`] === q.correct) score++
    })
    
    quizData.trueFalse.forEach(q => {
      if (quizAnswers[`tf_${q.id}`] === q.correct) score++
    })

    const percentage = Math.round((score / maxScore) * 100)
    
    const results = {
      score,
      maxScore,
      percentage,
      masteryLevel: percentage >= 90 ? 'Expert' : percentage >= 70 ? 'Proficient' : percentage >= 50 ? 'Developing' : 'Novice',
    }
    
    setQuizResults(results)
    setQuizSubmitted(true)

    try {
      await saveQuizAttempt.mutateAsync({
        question_id: question.id,
        quiz_data: quizData,
        answers: quizAnswers,
        score: results.score,
        percentage: results.percentage,
        mastery_level: results.masteryLevel,
        weak_areas: [],
        strong_areas: [],
      })
      
      // Award XP
      const xpAmount = percentage >= 90 ? 50 : percentage >= 70 ? 30 : 20
      await awardXP.mutateAsync({ 
        action: percentage >= 90 ? 'perfect_quiz' : 'complete_quiz', 
        amount: xpAmount,
        description: `Completed quiz with ${percentage}% score`
      })
      
      toast({ title: `Quiz completed! Score: ${percentage}%`, variant: 'success' })
    } catch (error) {
      toast({ title: 'Failed to save quiz results', variant: 'error' })
    }
  }

  const handleGenerateNotes = async (type: 'revision' | 'bullet' | 'formula' | 'flashcard') => {
    if (!question) return
    setIsGeneratingNotes(true)
    try {
      const notes = await generateNotes(question.question, question.answer, question.subject, type)
      setGeneratedNotes(notes)
      setActiveTab('notes')
      
      // Auto save note
      await saveNote.mutateAsync({
        question_id: question.id,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notes: ${question.question.substring(0, 30)}...`,
        content: notes,
        note_type: type,
        subject: question.subject,
      })
      
      awardXP.mutate({ action: 'create_notes', amount: 15, description: `Generated ${type} notes` })
      toast({ title: 'Notes generated and saved!', variant: 'success' })
    } catch (error) {
      toast({ title: 'Failed to generate notes', variant: 'error' })
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-32 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleBookmark} className={isBookmarked ? 'text-primary border-primary/50' : ''}>
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Question Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-primary">{question.subject}</span>
          <span className="text-xs text-muted-foreground capitalize">• {question.difficulty} Level</span>
          <span className="text-xs text-muted-foreground capitalize">• {question.mode} Mode</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {question.question}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-secondary/50 rounded-xl mb-6 overflow-x-auto">
          <TabsTrigger value="explanation" className="gap-2 py-2.5 rounded-lg">
            <BookOpen className="h-4 w-4" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2 py-2.5 rounded-lg">
            <BrainCircuit className="h-4 w-4" />
            Practice Quiz
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 py-2.5 rounded-lg">
            <FileText className="h-4 w-4" />
            Smart Notes
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Explanation Tab */}
          <TabsContent value="explanation" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 sm:p-8 ai-message markdown-content"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <div className="code-block my-4 rounded-xl overflow-hidden border border-border">
                        <div className="bg-muted/50 px-4 py-1.5 text-xs font-mono text-muted-foreground border-b border-border flex items-center justify-between">
                          <span>{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0, background: 'rgba(0,0,0,0.3)' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {question.answer}
              </ReactMarkdown>

              {/* Follow Up Questions */}
              {question.follow_up_questions && Array.isArray(question.follow_up_questions) && (
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Follow-up Questions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.follow_up_questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => navigate('/ask', { state: { initialQuestion: q, subject: question.subject } })}
                        className="text-left p-4 rounded-xl border border-border bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all text-sm font-medium group"
                      >
                        <span className="group-hover:text-primary transition-colors">{String(q)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Practice Quiz Tab */}
          <TabsContent value="practice" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 sm:p-8"
            >
              {!quizData ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BrainCircuit className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Test Your Knowledge</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Generate an adaptive quiz based on this explanation to ensure you've mastered the concept.
                  </p>
                  <Button 
                    size="lg" 
                    variant="gradient" 
                    onClick={handleGenerateQuiz}
                    loading={isGeneratingQuiz}
                  >
                    Generate Quiz
                  </Button>
                </div>
              ) : !quizStarted ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-2">Quiz Ready!</h2>
                  <p className="text-muted-foreground mb-8">
                    {quizData.mcq.length + quizData.trueFalse.length} questions • ~5 minutes
                  </p>
                  <Button size="lg" onClick={() => setQuizStarted(true)} className="px-8">
                    Start Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Results View */}
                  {quizSubmitted && quizResults && (
                    <div className="p-6 rounded-2xl bg-secondary border border-border mb-8 text-center relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-2 h-full ${
                        quizResults.percentage >= 90 ? 'bg-emerald-500' :
                        quizResults.percentage >= 70 ? 'bg-primary' :
                        'bg-amber-500'
                      }`} />
                      <h3 className="text-3xl font-bold mb-2">{quizResults.percentage}% Score</h3>
                      <p className="text-muted-foreground mb-4">
                        You got {quizResults.score} out of {quizResults.maxScore} correct. Mastery Level: <span className="font-semibold text-foreground">{quizResults.masteryLevel}</span>
                      </p>
                      {quizResults.percentage < 70 && (
                        <div className="inline-flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium">
                          <AlertCircle className="h-4 w-4" />
                          Consider reviewing the explanation again.
                        </div>
                      )}
                    </div>
                  )}

                  {/* MCQ Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                      Multiple Choice
                    </h3>
                    {quizData.mcq.map((q, idx) => (
                      <div key={q.id} className="p-5 rounded-xl border border-border bg-card/30">
                        <p className="font-medium mb-4">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const optLetter = opt.charAt(0)
                            const isSelected = quizAnswers[`mcq_${q.id}`] === optLetter
                            const isCorrect = optLetter === q.correct
                            
                            let btnClass = "quiz-option "
                            if (quizSubmitted) {
                              if (isCorrect) btnClass += "correct "
                              else if (isSelected && !isCorrect) btnClass += "incorrect "
                            } else if (isSelected) {
                              btnClass += "selected "
                            }
                            
                            return (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [`mcq_${q.id}`]: optLetter }))}
                                className={btnClass}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* True/False Section */}
                  <div className="space-y-6 mt-8">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                      True or False
                    </h3>
                    {quizData.trueFalse.map((q, idx) => (
                      <div key={q.id} className="p-5 rounded-xl border border-border bg-card/30">
                        <p className="font-medium mb-4">{idx + 1}. {q.statement}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[true, false].map((val) => {
                            const isSelected = quizAnswers[`tf_${q.id}`] === val
                            const isCorrect = val === q.correct
                            
                            let btnClass = "quiz-option text-center "
                            if (quizSubmitted) {
                              if (isCorrect) btnClass += "correct "
                              else if (isSelected && !isCorrect) btnClass += "incorrect "
                            } else if (isSelected) {
                              btnClass += "selected "
                            }
                            
                            return (
                              <button
                                key={String(val)}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [`tf_${q.id}`]: val }))}
                                className={btnClass}
                              >
                                {val ? 'True' : 'False'}
                              </button>
                            )
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  {!quizSubmitted && (
                    <div className="pt-6 flex justify-end">
                      <Button size="lg" variant="gradient" onClick={handleQuizSubmit} className="px-8">
                        Submit Quiz
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Smart Notes Tab */}
          <TabsContent value="notes" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 sm:p-8"
            >
              {!generatedNotes ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Generate Smart Notes</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Create beautiful, concise study notes automatically from this explanation.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    {[
                      { type: 'revision', label: 'Revision Notes', icon: '📝' },
                      { type: 'bullet', label: 'Bullet Points', icon: '📋' },
                      { type: 'formula', label: 'Formula Sheet', icon: '∑' },
                      { type: 'flashcard', label: 'Flashcards', icon: '🎴' },
                    ].map(note => (
                      <Button
                        key={note.type}
                        variant="outline"
                        className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-border hover:border-primary/50"
                        onClick={() => handleGenerateNotes(note.type as any)}
                        disabled={isGeneratingNotes}
                      >
                        <span className="text-2xl">{note.icon}</span>
                        <span>Generate {note.label}</span>
                      </Button>
                    ))}
                  </div>
                  {isGeneratingNotes && <p className="mt-6 text-sm text-muted-foreground animate-pulse">Generating your customized notes...</p>}
                </div>
              ) : (
                <div className="markdown-content ai-message">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={() => setGeneratedNotes(null)}>
                      Generate Different Type
                    </Button>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="my-4 rounded-xl overflow-hidden border border-border">
                            <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" customStyle={{ margin: 0 }}>
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code {...props} className={className}>{children}</code>
                        )
                      }
                    }}
                  >
                    {generatedNotes}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
