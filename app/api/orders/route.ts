import { NextRequest } from 'next/server'
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'
import type { CartItem } from '@/lib/types'

export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get orders error:', error)
    return err('Failed to fetch orders', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const body = await request.json()
  const { cartItems, totalAmount, shippingAddress, billingAddress } = body as {
    cartItems: CartItem[]
    totalAmount: number
    shippingAddress?: string
    billingAddress?: string
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return err('cartItems must be a non-empty array', 400)
  }
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return err('totalAmount must be a positive number', 400)
  }

  // ── Create the order ──────────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: shippingAddress,
      billing_address: billingAddress,
    }])
    .select()
    .single()

  if (orderError) {
    console.error('Create order error:', orderError)
    return err('Failed to create order', 500)
  }

  // ── Insert order items ────────────────────────────────────────────────────
  const orderItemsData = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.product?.price ?? 0,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    console.error('Create order items error:', itemsError)
    return err('Failed to create order items', 500)
  }

  // ── Clear the user's DB cart ──────────────────────────────────────────────
  // Note: stock was already decremented when items were added to cart,
  // so we do NOT decrement again here.
  const { error: cartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  if (cartError) {
    console.error('Clear cart after order error (non-fatal):', cartError)
  }

  return ok(order, 201)
}
