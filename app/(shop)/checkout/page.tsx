'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { useCart } from '@/lib/store/cart'
import { CartItem } from '@/lib/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Shipping form + Stripe PaymentElement ────────────────────────────────────

interface PaymentFormProps {
  cartItems: CartItem[]
  clientSecret: string
  orderId: string
  totalAmount: number
}

function PaymentForm({ cartItems, clientSecret, orderId, totalAmount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe will redirect here after 3DS / bank redirects
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
      // For cards that don't need a redirect, handle in-page
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.')
      setProcessing(false)
      return
    }

    // Payment succeeded without a redirect
    clearCart()
    router.push(`/order-confirmation/${orderId}`)
  }

  const SHIPPING = 10
  const TAX_RATE = 0.1
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  )
  const tax = (subtotal + SHIPPING) * TAX_RATE

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items summary */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <PaymentElement />
            {errorMessage && (
              <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
            )}
          </Card>
        </div>

        {/* Right column — order summary */}
        <div>
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 pb-6 border-b text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${SHIPPING.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-amber-800">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={!stripe || processing}
            >
              {processing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Secured by Stripe. Use card <strong>4242 4242 4242 4242</strong> for testing.
            </p>
          </Card>
        </div>
      </div>
    </form>
  )
}

// ─── Shipping info step ───────────────────────────────────────────────────────

interface ShippingFormData {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
}

const EMPTY_SHIPPING: ShippingFormData = {
  fullName: '', email: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', zipCode: '', country: '',
}

// ─── Main checkout page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shipping, setShipping] = useState<ShippingFormData>(EMPTY_SHIPPING)
  // After shipping is submitted we get a clientSecret from Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const router = useRouter()

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const result = await res.json()
      if (result.success) setCartItems(result.data ?? [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])
  useRefetchOnFocus(fetchCart)

  const handleShippingSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCreatingIntent(true)
    setIntentError(null)

    const shippingAddress = [
      shipping.addressLine1,
      shipping.addressLine2,
      shipping.city,
      `${shipping.state} ${shipping.zipCode}`,
      shipping.country,
    ].filter(Boolean).join(', ')

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, shippingAddress }),
      })
      const result = await res.json()

      if (!result.success) {
        setIntentError(result.error ?? 'Failed to initialise payment')
        return
      }

      setClientSecret(result.data.clientSecret)
      setOrderId(result.data.orderId)
      setTotalAmount(result.data.totalAmount)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setIntentError('Something went wrong. Please try again.')
    } finally {
      setCreatingIntent(false)
    }
  }

  const setField = (field: keyof ShippingFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShipping((prev) => ({ ...prev, [field]: e.target.value }))

  if (loading) return <LoadingSpinner />

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/')}>Back to Shopping</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* ── Step 1: Shipping ── */}
        {!clientSecret && (
          <div className="grid lg:grid-cols-3 gap-8">
            <form onSubmit={handleShippingSubmit} className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Full Name" required value={shipping.fullName} onChange={setField('fullName')} />
                  <Input placeholder="Email" type="email" required value={shipping.email} onChange={setField('email')} />
                </div>
                <Input placeholder="Phone Number" className="mt-4" required value={shipping.phone} onChange={setField('phone')} />
                <Input placeholder="Address Line 1" className="mt-4" required value={shipping.addressLine1} onChange={setField('addressLine1')} />
                <Input placeholder="Address Line 2 (Optional)" className="mt-4" value={shipping.addressLine2} onChange={setField('addressLine2')} />
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Input placeholder="City" required value={shipping.city} onChange={setField('city')} />
                  <Input placeholder="State / Province" required value={shipping.state} onChange={setField('state')} />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Input placeholder="Zip / Postal Code" required value={shipping.zipCode} onChange={setField('zipCode')} />
                  <Input placeholder="Country" required value={shipping.country} onChange={setField('country')} />
                </div>
                {intentError && <p className="mt-4 text-sm text-red-600">{intentError}</p>}
              </Card>

              <Button type="submit" className="w-full py-6 text-lg" disabled={creatingIntent}>
                {creatingIntent ? 'Preparing payment...' : 'Continue to Payment'}
              </Button>
            </form>

            {/* Mini order summary */}
            <div>
              <Card className="p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Your Cart</h2>
                <div className="space-y-3 text-sm">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-700">{item.product?.name} × {item.quantity}</span>
                      <span>${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {clientSecret && orderId && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'stripe' } }}
          >
            <PaymentForm
              cartItems={cartItems}
              clientSecret={clientSecret}
              orderId={orderId}
              totalAmount={totalAmount}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
