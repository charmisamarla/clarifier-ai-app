import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  History, 
  Bookmark, 
  StickyNote, 
  BarChart3, 
  User, 
  Settings,
  X,
  Zap,
  RefreshCw,
  Flame,
  Trophy,
  BookOpen,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { calculateLevel } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ask', icon: MessageSquarePlus, label: 'Ask AI', badge: '✨' },
  { to: '/history', icon: History, label: 'Learning History' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/notes', icon: StickyNote, label: 'Smart Notes' },
  { to: '/revision', icon: RefreshCw, label: 'Revision Queue' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  
  const levelData = calculateLevel(profile?.xp || 0)
  const xpProgress = levelData.nextLevelXp > levelData.currentLevelXp
    ? ((profile?.xp || 0) - levelData.currentLevelXp) / (levelData.nextLevelXp - levelData.currentLevelXp) * 100
    : 100
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg glow-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base gradient-text">Clarifier AI</h1>
            <p className="text-xs text-muted-foreground">Learn. Master.</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4">
        <div className="glass-card p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <div className="flex items-center gap-1.5">
                <span className="level-badge">Lvl {levelData.level}</span>
                <span className="text-xs text-muted-foreground truncate">{levelData.title}</span>
              </div>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>{profile?.xp || 0} XP</span>
              </span>
              <span className="text-xs text-muted-foreground">{levelData.nextLevelXp} XP next</span>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>
          
          {/* Streak */}
          {(profile?.streak || 0) > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
              <Flame className="h-4 w-4 text-orange-400 streak-fire" />
              <span className="text-xs font-medium">{profile?.streak} day streak</span>
              <Trophy className="h-3 w-3 text-amber-400 ml-auto" />
              <span className="text-xs text-muted-foreground">Best: {profile?.longest_streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 sidebar-scroll overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
          Main
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active')
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs">{item.badge}</span>
            )}
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            Account
          </p>
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active')
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-xl shrink-0 h-full"
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 border-r border-border bg-card backdrop-blur-xl shadow-2xl flex flex-col lg:hidden"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
