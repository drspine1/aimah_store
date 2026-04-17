import { NextRequest } from 'next/server'
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { id } = await params

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('id', id)
    .eq('user_id', user.id) // ensures users can only fetch their own orders
    .single()

  if (error) {
    if (error.code === 'PGRST116') return err('Order not found', 404)
    console.error('Get order error:', error)
    return err('Failed to fetch order', 500)
  }

  return ok(data)
}
