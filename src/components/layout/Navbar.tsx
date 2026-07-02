import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Moon, Sun, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center px-4 gap-3 shrink-0 sticky top-0 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, width: '40px' }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: '40px' }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { setSearchOpen(false); setSearchQuery('') }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    navigate(`/history?search=${encodeURIComponent(searchQuery)}`)
                    setSearchOpen(false)
                    setSearchQuery('')
                  }
                  if (e.key === 'Escape') {
                    setSearchOpen(false)
                    setSearchQuery('')
                  }
                }}
                placeholder="Search your learning history..."
                className={cn(
                  "w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-secondary/50",
                  "text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                  "focus:ring-primary/50 focus:border-primary/50 transition-all"
                )}
              />
            </motion.div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-secondary/30 text-sm text-muted-foreground hover:bg-secondary/50 transition-all w-full max-w-xs"
            >
              <Search className="h-4 w-4" />
              <span>Search learning history...</span>
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Ask AI Button */}
        <Button
          variant="gradient"
          size="sm"
          onClick={() => navigate('/ask')}
          className="hidden sm:flex gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Ask AI
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-accent transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-rose-400">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
