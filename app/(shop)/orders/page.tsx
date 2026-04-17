'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Order } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { fadeUp, viewport } from '@/lib/animations'
import { ArrowRight } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  delivered:  'bg-amber-100 text-amber-900',
  shipped:    'bg-stone-200 text-stone-800',
  processing: 'bg-amber-200 text-amber-800',
  pending:    'bg-amber-50 text-amber-700 border border-amber-300',
  cancelled:  'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const result = await res.json()
      if (result.success) setOrders(result.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useRefetchOnFocus(fetchOrders)

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-bold text-amber-950 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-8 text-center border-amber-200">
            <p className="text-stone-600 text-lg mb-4">
              You haven&apos;t placed any orders yet.
            </p>
            <Link href="/">
              <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50">Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial="hidden" whileInView="visible" viewport={viewport}
                variants={fadeUp} custom={i * 0.08}
              >
                <Card className="p-6 border-amber-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-stone-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-stone-600">
                        Items: {order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0}
                      </p>
                      <p className="text-lg font-semibold text-amber-950">
                        Total: ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_STYLE[order.status] ?? 'bg-amber-50 text-amber-700'}`}>
                      {order.status}
                    </span>
                    <Link href={`/order-confirmation/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2 text-amber-800 hover:text-amber-900">
                        View Details <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-100">
                    <p className="text-sm text-stone-500 mb-2">Items:</p>
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-sm text-stone-700">
                          {item.product?.name} (×{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
