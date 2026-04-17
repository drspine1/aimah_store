'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { User, Lock, CheckCircle } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setEmail(data.user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single()

      setFullName(profile?.full_name ?? '')
      setLoading(false)
    })
  }, [router])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setProfileSaving(false)
    setProfileMsg(
      error
        ? { type: 'error', text: error.message }
        : { type: 'success', text: 'Profile updated successfully.' }
    )
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setPasswordSaving(true)
    const supabase = createClient()

    // Re-authenticate first to verify current password
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordSaving(false)
      setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 md:px-6 space-y-8">
        <h1 className="text-3xl font-bold text-amber-950">Account Settings</h1>

        {/* ── Profile ── */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <User size={20} className="text-amber-700" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-stone-700">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="border-amber-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="border-amber-200 bg-amber-50 text-stone-500 cursor-not-allowed"
                />
                <p className="text-xs text-stone-400">Email cannot be changed here.</p>
              </div>
              {profileMsg && (
                <p className={`text-sm flex items-center gap-1 ${profileMsg.type === 'success' ? 'text-amber-700' : 'text-red-600'}`}>
                  {profileMsg.type === 'success' && <CheckCircle size={14} />}
                  {profileMsg.text}
                </p>
              )}
              <Button
                type="submit"
                disabled={profileSaving}
                className="bg-amber-800 hover:bg-amber-700 text-amber-50"
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Password ── */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <Lock size={20} className="text-amber-700" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword" className="text-stone-700">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-amber-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-stone-700">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-amber-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-stone-700">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-amber-300"
                />
              </div>
              {passwordMsg && (
                <p className={`text-sm flex items-center gap-1 ${passwordMsg.type === 'success' ? 'text-amber-700' : 'text-red-600'}`}>
                  {passwordMsg.type === 'success' && <CheckCircle size={14} />}
                  {passwordMsg.text}
                </p>
              )}
              <Button
                type="submit"
                disabled={passwordSaving}
                className="bg-amber-800 hover:bg-amber-700 text-amber-50"
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
