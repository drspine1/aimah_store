/**
 * Stripe webhook handler.
 *
 * Listens for payment_intent.succeeded to:
 *  1. Create order_items rows
 *  2. Decrement product stock
 *  3. Mark the order as 'processing'
 *  4. Clear the user's DB cart
 *
 * payment_intent.payment_failed → marks the order as 'cancelled'
 *
 * To test locally:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Use the service-role key here so we can write without RLS restrictions
// (the webhook runs server-side with no user session)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // ── payment_intent.succeeded ──────────────────────────────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata.order_id
    const userId = intent.metadata.user_id

    if (!orderId || !userId) {
      console.error('Webhook: missing metadata on payment intent', intent.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // Fetch the cart items to build order_items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, product:products(id, name, price, stock)')
      .eq('user_id', userId)

    if (cartError || !cartItems?.length) {
      console.error('Webhook: could not fetch cart for user', userId, cartError)
      // Cart may already be cleared on a retry — mark order processing anyway
    }

    if (cartItems?.length) {
      // Insert order items
      const orderItemsData = cartItems.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: (item.product as { price: number }).price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

      if (itemsError) {
        console.error('Webhook: failed to insert order items:', itemsError)
      }

      // Decrement stock
      for (const item of cartItems) {
        const product = item.product as { id: string; stock: number }
        await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', product.id)
      }

      // Clear the DB cart
      await supabase.from('cart_items').delete().eq('user_id', userId)
    }

    // Mark order as processing
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)

    console.log(`Order ${orderId} marked as processing after successful payment`)
  }

  // ── payment_intent.payment_failed ─────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata.order_id

    if (orderId) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)

      console.log(`Order ${orderId} cancelled after payment failure`)
    }
  }

  return NextResponse.json({ received: true })
}

// Stripe sends raw body — disable Next.js body parsing
export const config = {
  api: { bodyParser: false },
}
