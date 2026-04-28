/**
 * Cart cleanup — expires cart items older than 1 hour and restores stock.
 * Called:
 *  - GET /api/cart/cleanup  (triggered by the cart page on load)
 *  - Can also be hit by a cron job / Vercel cron
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  const supabase = getServiceClient()

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // Fetch expired cart items
  const { data: expired, error: fetchError } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity')
    .lt('created_at', oneHourAgo)

  if (fetchError) {
    console.error('Cart cleanup fetch error:', fetchError)
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ success: true, expired: 0 })
  }

  // Restore stock for each expired item
  for (const item of expired) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    if (product) {
      await supabase
        .from('products')
        .update({ stock: product.stock + item.quantity })
        .eq('id', item.product_id)
    }
  }

  // Delete expired cart items
  const expiredIds = expired.map((i) => i.id)
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .in('id', expiredIds)

  if (deleteError) {
    console.error('Cart cleanup delete error:', deleteError)
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
  }

  console.log(`Cart cleanup: removed ${expired.length} expired item(s)`)
  return NextResponse.json({ success: true, expired: expired.length })
}
