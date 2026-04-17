import { NextRequest } from 'next/server'
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

// Admin: update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return err('Forbidden', 403)

  const { id } = await params
  const { status } = await request.json()

  if (!VALID_STATUSES.includes(status)) {
    return err(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400)
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Admin update order error:', error)
    return err('Failed to update order', 500)
  }

  return ok(data)
}
