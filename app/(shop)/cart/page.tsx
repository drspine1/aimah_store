'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CartItem } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { useCart } from '@/lib/store/cart'
import { fadeUp, scaleUp, viewport } from '@/lib/animations'
import { Trash2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { clearCart } = useCart()

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const result = await res.json()
      if (result.success) {
        const items = result.data || []
        setCartItems(items)
        if (items.length === 0) clearCart()
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [clearCart])

  useEffect(() => { fetchCart() }, [fetchCart])
  useRefetchOnFocus(fetchCart)

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      })
      if (res.ok) await fetchCart()
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' })
      if (res.ok) await fetchCart()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
  )
  const shipping = 10
  const tax = (totalPrice + shipping) * 0.1
  const total = totalPrice + shipping + tax

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 hover:underline mb-8">
          <ArrowLeft size={20} />
          Back to Shopping
        </Link>

        <h1 className="text-4xl font-bold text-amber-950 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-8 text-center border-amber-200">
            <p className="text-stone-600 text-lg mb-4">Your cart is empty</p>
            <Link href="/">
              <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50">Continue Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial="hidden" whileInView="visible" viewport={viewport}
                  variants={fadeUp} custom={i * 0.08}
                >
                  <Card className="p-4 md:p-6 border-amber-200">
                  <div className="flex gap-4">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        width={120}
                        height={120}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-amber-400">No image</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-amber-950 mb-2">
                        {item.product?.name}
                      </h3>
                      <p className="text-stone-600 mb-4">
                        ${item.product?.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-amber-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-amber-100 text-amber-900"
                          >−</button>
                          <span className="px-4 py-2 text-amber-950">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-amber-100 text-amber-900"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-950">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={scaleUp} custom={0.2}
            >
              <Card className="p-6 sticky top-8 border-amber-200">
                <h2 className="text-xl font-bold text-amber-950 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-amber-200">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax (10%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-amber-950">Total</span>
                  <span className="text-2xl font-bold text-amber-800">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full py-6 text-lg bg-amber-800 hover:bg-amber-700 text-amber-50"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => router.push('/')}
                >
                  Continue Shopping
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
