import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Search, Filter, Trash2, Edit3, Eye, FileText, ArrowUpRight } from 'lucide-react'
import { useNotes, useDeleteNote, useUserSubjects } from '@/hooks/useData'
import { getSubjectIcon, getSubjectColor, formatRelativeTime, formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Note } from '@/types/database'
import { ALL_SUBJECTS } from '@/lib/constants'

export function NotesPage() {
  const navigate = useNavigate()
  
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  
  const { data: userSubjects } = useUserSubjects()
  const { data: notes, isLoading } = useNotes({ subject: subjectFilter, noteType: typeFilter })
  const deleteNote = useDeleteNote()

  const availableSubjects = userSubjects && userSubjects.length > 0 ? userSubjects : ALL_SUBJECTS

  const filteredNotes = notes?.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote.mutateAsync(id)
        toast({ title: 'Note deleted', variant: 'success' })
      } catch (error) {
        toast({ title: 'Failed to delete note', variant: 'error' })
      }
    }
  }

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'revision': return '📝'
      case 'bullet': return '📋'
      case 'formula': return '∑'
      case 'flashcard': return '🎴'
      default: return '📄'
    }
  }

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'revision': return 'Revision Note'
      case 'bullet': return 'Bullet Points'
      case 'formula': return 'Formula Sheet'
      case 'flashcard': return 'Flashcards'
      default: return type
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <StickyNote className="h-6 w-6" />
            </div>
            Smart Notes
          </h1>
          <p className="text-muted-foreground mt-2">
            Auto-generated study materials from your learning sessions
          </p>
        </div>
      </div>

      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-9 bg-background/50 border-none"
          />
        </div>
        
        <div className="md:col-span-3">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="bg-background/50 border-none">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{subjectFilter === 'all' ? 'All Subjects' : subjectFilter}</span>
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

        <div className="md:col-span-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-background/50 border-none">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{typeFilter === 'all' ? 'All Types' : getNoteTypeLabel(typeFilter)}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="revision">Revision Notes</SelectItem>
              <SelectItem value="bullet">Bullet Points</SelectItem>
              <SelectItem value="formula">Formula Sheets</SelectItem>
              <SelectItem value="flashcard">Flashcards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 break-inside-avoid">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : filteredNotes?.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card break-inside-avoid">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <StickyNote className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {search || subjectFilter !== 'all' || typeFilter !== 'all'
                ? "Try adjusting your filters" 
                : "Generate notes after asking questions to see them here"}
            </p>
            {!search && subjectFilter === 'all' && typeFilter === 'all' && (
              <Button onClick={() => navigate('/ask')}>Ask a Doubt</Button>
            )}
          </div>
        ) : (
          filteredNotes?.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedNote(note)}
              className="glass-card p-5 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer group break-inside-avoid relative overflow-hidden flex flex-col"
            >
              {/* Note Header */}
              <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                <h3 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  <span className="mr-2 opacity-80">{getNoteTypeIcon(note.note_type)}</span>
                  {note.title}
                </h3>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getSubjectColor(note.subject)} text-white shadow-sm flex items-center gap-1`}>
                  {getSubjectIcon(note.subject)} {note.subject}
                </span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                  {getNoteTypeLabel(note.note_type)}
                </span>
              </div>

              <div className="text-sm text-muted-foreground/80 line-clamp-6 mb-4 relative z-10 markdown-content prose-sm prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {note.content.substring(0, 300) + (note.content.length > 300 ? '...' : '')}
                </ReactMarkdown>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 relative z-10">
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.updated_at)}
                </span>
                
                {note.question_id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/session/${note.question_id}`)
                    }}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    View Original <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View Note Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedNote && (
            <>
              <DialogHeader className="mb-4 pr-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${getSubjectColor(selectedNote.subject)} text-white shadow-sm flex items-center gap-1`}>
                    {getSubjectIcon(selectedNote.subject)} {selectedNote.subject}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                    {getNoteTypeIcon(selectedNote.note_type)} {getNoteTypeLabel(selectedNote.note_type)}
                  </span>
                </div>
                <DialogTitle className="text-2xl leading-tight">{selectedNote.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generated on {formatDate(selectedNote.created_at)}
                </p>
              </DialogHeader>

              <div className="markdown-content ai-message prose-sm sm:prose-base prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>

              {selectedNote.question_id && (
                <div className="mt-8 pt-4 border-t border-border flex justify-end">
                  <Button variant="outline" onClick={() => navigate(`/session/${selectedNote.question_id}`)}>
                    View Original Q&A
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
