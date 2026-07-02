import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-32 h-32 mx-auto mb-8 relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-card border-4 border-primary/20 rounded-full flex items-center justify-center shadow-xl">
            <Compass className="h-12 w-12 text-primary" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-black mb-2 gradient-text">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page not found</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Looks like you've wandered off the learning path. Let's get you back on track.
          </p>
          
          <Link to="/">
            <Button size="lg" variant="gradient" className="gap-2 px-8">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
