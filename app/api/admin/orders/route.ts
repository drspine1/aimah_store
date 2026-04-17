import { requireUser, ok, err } from '@/lib/supabase/api-helpers'

// Admin: get ALL orders (all users) with items
export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return err('Forbidden', 403)

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name, price))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin get orders error:', error)
    return err('Failed to fetch orders', 500)
  }

  return ok(data ?? [])
}
