import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'
import type { CartItem } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const body = await request.json()
  const { cartItems, shippingAddress, billingAddress } = body as {
    cartItems: CartItem[]
    shippingAddress: string
    billingAddress?: string
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return err('cartItems must be a non-empty array', 400)
  }

  // ── Verify stock before charging ─────────────────────────────────────────
  const productIds = cartItems.map((i) => i.product_id)
  const { data: products, error: stockError } = await supabase
    .from('products')
    .select('id, name, stock, price')
    .in('id', productIds)

  if (stockError) return err('Failed to verify stock', 500)

  for (const item of cartItems) {
    const product = products?.find((p) => p.id === item.product_id)
    if (!product) return err(`Product not found: ${item.product_id}`, 400)
    if (product.stock < item.quantity) {
      return err(`"${product.name}" only has ${product.stock} unit(s) in stock`, 400)
    }
  }

  // ── Calculate total from DB prices (never trust client-sent prices) ───────
  const subtotal = cartItems.reduce((sum, item) => {
    const product = products!.find((p) => p.id === item.product_id)!
    return sum + product.price * item.quantity
  }, 0)

  const SHIPPING = 10
  const TAX_RATE = 0.1
  const totalAmount = subtotal + SHIPPING + (subtotal + SHIPPING) * TAX_RATE
  // Stripe expects amounts in the smallest currency unit (cents)
  const amountInCents = Math.round(totalAmount * 100)

  // ── Create a pending order row so we have an ID to attach to the intent ──
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: shippingAddress,
      billing_address: billingAddress ?? shippingAddress,
    }])
    .select()
    .single()

  if (orderError) {
    console.error('Create pending order error:', orderError)
    return err('Failed to create order', 500)
  }

  // ── Create Stripe PaymentIntent ───────────────────────────────────────────
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      order_id: order.id,
      user_id: user.id,
    },
  })

  // ── Store the payment intent ID on the order ──────────────────────────────
  await supabase
    .from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', order.id)

  return ok({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
    totalAmount,
  })
}
