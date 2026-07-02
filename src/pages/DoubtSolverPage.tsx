import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mic, Loader2, ArrowRight, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserSubjects, useSaveQuestion, useAwardXP } from '@/hooks/useData'
import { askQuestion, type LearningMode, type TutorStyle, type Difficulty, generateFollowUpQuestions } from '@/lib/groq'
import { LEARNING_MODES, TUTOR_STYLES, DIFFICULTIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import { ALL_SUBJECTS } from '@/lib/constants'

export function DoubtSolverPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: userSubjects } = useUserSubjects()
  const saveQuestion = useSaveQuestion()
  const awardXP = useAwardXP()

  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState<string>('')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [mode, setMode] = useState<LearningMode>('standard')
  const [style, setStyle] = useState<TutorStyle>('teacher')
  
  const [isRecording, setIsRecording] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  // Use user's selected subjects if available, otherwise all subjects
  const availableSubjects = userSubjects && userSubjects.length > 0 ? userSubjects : ALL_SUBJECTS

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: 'Speech recognition not supported in this browser', variant: 'error' })
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
      toast({ title: 'Listening...', description: 'Speak your question clearly.' })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuestion(prev => prev ? `${prev} ${transcript}` : transcript)
    }

    recognition.onerror = (event: any) => {
      console.error(event.error)
      toast({ title: 'Microphone error', description: event.error, variant: 'error' })
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({ title: 'Please enter a question', variant: 'warning' })
      return
    }
    if (!subject) {
      toast({ title: 'Please select a subject', variant: 'warning' })
      return
    }

    setIsThinking(true)
    try {
      // 1. Get answer from Groq
      const answer = await askQuestion({ question, subject, difficulty, mode, style })
      
      // 2. If story mode, answer is the story answer. Otherwise get story answer? (For now, keep it simple based on mode)
      let standardAnswer = answer
      let storyAnswer: string | undefined = undefined
      
      if (mode === 'story') {
        storyAnswer = answer
        // Optional: generate standard answer too in background if needed
      }

      // 3. Generate follow-up questions
      const followUps = await generateFollowUpQuestions(question, standardAnswer, subject)

      // 4. Save to database
      const savedQuestion = await saveQuestion.mutateAsync({
        question,
        answer: standardAnswer,
        story_answer: storyAnswer,
        subject,
        difficulty,
        mode,
        style,
        follow_up_questions: followUps,
      })

      // 5. Award XP
      await awardXP.mutateAsync({ 
        action: 'ask_question', 
        amount: 10,
        description: 'Asked a new question'
      })

      // 6. Navigate to session page
      navigate(`/session/${savedQuestion.id}`)
      
    } catch (error: any) {
      toast({ title: 'Failed to generate answer', description: error.message, variant: 'error' })
      setIsThinking(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient shadow-xl glow mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Ask Clarifier AI</h1>
        <p className="text-muted-foreground text-lg">
          What do you want to learn or understand better today?
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6">
        {/* Main Input */}
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question or concept here... (e.g., Explain recursion with a real world example)"
            className="min-h-[160px] text-base p-5 pr-16 bg-background/50 focus:bg-background transition-colors shadow-inner rounded-2xl resize-none"
          />
          <button
            onClick={handleMicClick}
            className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subject */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Subject</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Level</label>
            <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <span className={d.color}>{d.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Learning Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Mode</label>
            <Select value={mode} onValueChange={(v: LearningMode) => setMode(v)}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_MODES.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tutor Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Tutor Style</label>
            <Select value={style} onValueChange={(v: TutorStyle) => setStyle(v)}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                {TUTOR_STYLES.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Clear, accurate, and personalized explanations.
          </p>
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={handleSubmit}
            disabled={isThinking || !question.trim() || !subject}
          >
            {isThinking ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                Clarify This
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Quick Prompts */}
      {!question && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-6"
        >
          <p className="col-span-full text-sm font-medium text-muted-foreground mb-1">Try asking:</p>
          {[
            { q: 'Explain Time Complexity (Big O)', sub: 'Computer Science' },
            { q: 'How does a React hook work under the hood?', sub: 'React' },
            { q: 'Explain Newton\'s Third Law', sub: 'Physics' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(item.q)
                setSubject(item.sub)
              }}
              className="text-left p-4 rounded-xl border border-border bg-card/30 hover:bg-card hover:border-primary/40 transition-all text-sm group"
            >
              <span className="text-foreground block mb-2 font-medium">{item.q}</span>
              <span className="text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">{item.sub}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
