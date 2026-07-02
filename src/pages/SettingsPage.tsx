import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Shield, LogOut, Loader2, Moon, Sun, Laptop } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUpdateProfile } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/useToast'
import { ALL_SUBJECTS } from '@/lib/constants'

export function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const updateProfile = useUpdateProfile()
  
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile.mutateAsync({ full_name: name })
      toast({ title: 'Profile updated successfully', variant: 'success' })
    } catch (error) {
      toast({ title: 'Failed to update profile', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      toast({ title: 'Error signing out', variant: 'error' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation (Optional for larger screens, but keeping simple for now) */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map(tab => (
             <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                tab.id === 'profile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Profile Settings */}
          <div className="glass-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your account details</p>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name" 
                />
              </div>
              
              <Button 
                onClick={handleSaveProfile} 
                loading={saving} 
                disabled={name === profile?.full_name || !name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="glass-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how Clarifier AI looks</p>
            </div>
            
            <div className="flex gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === t.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <t.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border-rose-500/20 bg-rose-500/5">
            <div>
              <h2 className="text-xl font-bold text-rose-500 mb-1">Danger Zone</h2>
              <p className="text-sm text-rose-500/80 mb-6">Irreversible and destructive actions</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
              </div>
              <Button variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
