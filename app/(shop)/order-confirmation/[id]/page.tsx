'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Order } from '@/lib/types'
import { CheckCircle } from 'lucide-react'

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>() ?? {}
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((result) => { if (result.success) setOrder(result.data) })
      .catch((e) => console.error('Error fetching order:', e))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />

  if (!order) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center border-amber-200">
          <p className="text-stone-600 mb-4">Order not found</p>
          <Link href="/"><Button className="bg-amber-800 hover:bg-amber-700 text-amber-50">Back to Home</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <Card className="p-8 text-center border-amber-200">
          <CheckCircle className="w-16 h-16 text-amber-700 mx-auto mb-6" />

          <h1 className="text-4xl font-bold text-amber-950 mb-2">Order Confirmed!</h1>
          <p className="text-stone-600 text-lg mb-6">
            Thank you for your purchase. Your order has been received.
          </p>

          <Card className="bg-amber-100/60 border-amber-200 p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <p className="text-stone-500 text-sm">Order Number</p>
                <p className="text-2xl font-bold text-amber-950">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-left">
                <p className="text-stone-500 text-sm">Order Total</p>
                <p className="text-2xl font-bold text-amber-950">${order.total_amount.toFixed(2)}</p>
              </div>
              <div className="text-left">
                <p className="text-stone-500 text-sm">Order Date</p>
                <p className="text-xl font-semibold text-amber-950">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left">
                <p className="text-stone-500 text-sm">Status</p>
                <p className="text-xl font-semibold text-amber-700 capitalize">{order.status}</p>
              </div>
            </div>
          </Card>

          {order.items && order.items.length > 0 && (
            <Card className="p-6 mb-8 text-left border-amber-200">
              <h2 className="text-xl font-bold text-amber-950 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 border-b border-amber-100 last:border-0">
                    <div>
                      <p className="font-semibold text-amber-950">{item.product?.name}</p>
                      <p className="text-stone-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-amber-950">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {order.shipping_address && (
            <Card className="p-6 mb-8 text-left bg-amber-100/60 border-amber-200">
              <h2 className="text-xl font-bold text-amber-950 mb-3">Shipping Address</h2>
              <p className="text-stone-700 whitespace-pre-wrap">{order.shipping_address}</p>
            </Card>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/orders">
              <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50">View My Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">Continue Shopping</Button>
            </Link>
          </div>

          <p className="text-stone-500 text-sm mt-8">
            A confirmation email has been sent to your email address.
          </p>
        </Card>
      </div>
    </div>
  )
}
