import { NextRequest } from 'next/server'
import { requireUser, ok, okEmpty, err } from '@/lib/supabase/api-helpers'

export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('wishlist')
    .select('*, product:products(*)')
    .eq('user_id', user.id)

  if (error) {
    console.error('Get wishlist error:', error)
    return err('Failed to fetch wishlist', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const body = await request.json()
  const productId: string | undefined = body.productId

  if (!productId) return err('productId is required', 400)

  const { data, error } = await supabase
    .from('wishlist')
    .insert([{ user_id: user.id, product_id: productId }])
    .select('*, product:products(*)')
    .single()

  if (error) {
    if (error.code === '23505') return err('Already in wishlist', 400)
    console.error('Add to wishlist error:', error)
    return err('Failed to add to wishlist', 500)
  }

  return ok(data, 201)
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const wishlistId = new URL(request.url).searchParams.get('id')
  if (!wishlistId) return err('Wishlist item ID required', 400)

  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', wishlistId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete wishlist error:', error)
    return err('Failed to delete wishlist item', 500)
  }
  return okEmpty()
}
