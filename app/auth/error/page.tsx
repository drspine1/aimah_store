import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-700 mx-auto mb-2" />
            <CardTitle className="text-2xl text-amber-950">Authentication Error</CardTitle>
            <CardDescription className="text-stone-600">
              Something went wrong during sign-in. The link may have expired or
              already been used. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full bg-amber-800 hover:bg-amber-700 text-amber-50">Back to Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100">
                Create an Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
