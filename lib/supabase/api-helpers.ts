/**
 * Shared helpers for API route handlers.
 * Centralises the auth guard and standard response shapes so every
 * route doesn't repeat the same 10-line block.
 */
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

// ─── Response helpers ────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function okEmpty(status = 200) {
  return NextResponse.json({ success: true }, { status })
}

export function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

/**
 * Resolves the current user from the request cookies.
 * Returns `{ user, supabase }` on success or `{ response }` (a 401) when
 * the user is not authenticated — callers should return `response` early.
 */
export async function requireUser(): Promise<
  | { user: User; supabase: Awaited<ReturnType<typeof createClient>>; response?: never }
  | { response: NextResponse; user?: never; supabase?: never }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response: err('Unauthorized', 401) }
  }

  return { user, supabase }
}
