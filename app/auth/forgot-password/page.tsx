'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
        ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/auth/reset-password`
        : `${window.location.origin}/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            {sent ? (
              <>
                <MailCheck className="w-12 h-12 text-amber-700 mx-auto mb-2" />
                <CardTitle className="text-2xl text-amber-950">Check your email</CardTitle>
                <CardDescription className="text-stone-600">
                  We sent a password reset link to <strong>{email}</strong>.
                  Check your inbox and follow the link.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl text-amber-950">Forgot Password</CardTitle>
                <CardDescription className="text-stone-600">
                  Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!sent && (
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-stone-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-amber-300 focus:ring-amber-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-800 hover:bg-amber-700 text-amber-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          )}

          <div className="px-6 pb-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 underline underline-offset-4"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
