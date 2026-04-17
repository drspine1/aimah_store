'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

export default function AdminSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSetup = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/admin/setup', { method: 'POST' })
      const result = await res.json()

      if (result.success) {
        setStatus('success')
        setMessage(result.data.message)
        setTimeout(() => router.push('/admin/products'), 2000)
      } else {
        setStatus('error')
        setMessage(result.error ?? 'Something went wrong')
      }
    } catch (e) {
      setStatus('error')
      setMessage('Network error: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">Admin Setup</CardTitle>
            <CardDescription>
              This page promotes your account to admin. It only works once —
              after the first admin is created it is permanently disabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'idle' && (
              <>
                <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p>
                    Make sure you are logged in as the account you want to be
                    admin before clicking below.
                  </p>
                </div>
                <Button className="w-full" onClick={handleSetup}>
                  Make me admin
                </Button>
              </>
            )}

            {status === 'loading' && (
              <p className="text-center text-gray-600">Setting up...</p>
            )}

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-semibold mb-1">✓ Done!</p>
                <p>{message}</p>
                <p className="mt-2 text-gray-500">Redirecting to admin panel...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <p className="font-semibold mb-1">Setup failed</p>
                <p>{message}</p>
                <Button className="mt-4 w-full" variant="outline" onClick={() => setStatus('idle')}>
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
