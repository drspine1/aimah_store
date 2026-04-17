'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { Order } from '@/lib/types'
import Link from 'next/link'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type OrderStatus = typeof ORDER_STATUSES[number]

const STATUS_COLOURS: Record<OrderStatus, string> = {
  pending:    'bg-amber-50 text-amber-700 border border-amber-300',
  processing: 'bg-amber-200 text-amber-800',
  shipped:    'bg-stone-200 text-stone-800',
  delivered:  'bg-amber-100 text-amber-900',
  cancelled:  'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const result = await res.json()
      if (result.success) setOrders(result.data ?? [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Admin guard
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', data.user.id).single()
      if (!profile?.is_admin) { router.push('/'); return }
      fetchOrders()
    })
  }, [router, fetchOrders])

  useRefetchOnFocus(fetchOrders)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await res.json()
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-amber-950">Order Management</h1>
          <Link href="/admin/products">
            <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">Manage Products</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {ORDER_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length
            return (
              <Card key={s} className="p-4 text-center border-amber-200">
                <p className="text-2xl font-bold text-amber-950">{count}</p>
                <p className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${STATUS_COLOURS[s]}`}>
                  {s}
                </p>
              </Card>
            )
          })}
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center border-amber-200">
            <p className="text-stone-600 text-lg">No orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 border-amber-200">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-amber-950">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLOURS[order.status as OrderStatus]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-stone-600 mt-1">{order.shipping_address}</p>
                    {order.items && order.items.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.id} className="text-sm text-stone-700">
                            {item.product?.name} × {item.quantity} —{' '}
                            <span className="font-medium">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 font-bold text-amber-950">
                      Total: ${order.total_amount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-48">
                    <p className="text-xs font-medium text-stone-500 uppercase">Update status</p>
                    {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="capitalize justify-start border-amber-300 text-amber-800 hover:bg-amber-100"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, s)}
                      >
                        → {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
