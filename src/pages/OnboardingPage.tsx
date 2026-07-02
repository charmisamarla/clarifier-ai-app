import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateSubjects, useUpdateProfile } from '@/hooks/useData'
import { ALL_SUBJECTS } from '@/lib/constants'
import { getSubjectColor, getSubjectIcon } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [step, setStep] = useState(1)
  
  const updateSubjects = useUpdateSubjects()
  const updateProfile = useUpdateProfile()

  const filteredSubjects = ALL_SUBJECTS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleComplete = async () => {
    if (selectedSubjects.length === 0) {
      toast({ title: 'Select at least one subject', variant: 'error' })
      return
    }

    try {
      await updateSubjects.mutateAsync(selectedSubjects)
      await updateProfile.mutateAsync({ onboarding_completed: true })
      await refreshProfile()
      toast({ title: '🎉 Welcome to Clarifier AI!', description: 'Your learning journey begins now.', variant: 'success' })
      navigate('/dashboard')
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient shadow-xl glow mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">What do you want to learn?</h1>
          <p className="text-muted-foreground">
            Select subjects you're interested in. You can change these anytime in Settings.
          </p>
          {selectedSubjects.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="badge-primary">{selectedSubjects.length} selected</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full h-11 pl-9 pr-9 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Selected subjects preview */}
        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSubjects.map(s => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-colors"
              >
                <span>{getSubjectIcon(s)}</span>
                {s}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {/* Subject Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
          {filteredSubjects.map((subject) => {
            const selected = selectedSubjects.includes(subject)
            return (
              <motion.button
                key={subject}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSubject(subject)}
                className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <span className="text-xl leading-none">{getSubjectIcon(subject)}</span>
                <span className="flex-1 truncate">{subject}</span>
                {selected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </motion.button>
            )
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No subjects found for "{search}"</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleComplete}
            loading={updateSubjects.isPending || updateProfile.isPending}
            disabled={selectedSubjects.length === 0}
            className="px-8 gap-2"
          >
            Start Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can select multiple subjects and change them later in Settings
        </p>
      </motion.div>
    </div>
  )
}
