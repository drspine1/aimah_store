'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useCart } from '@/lib/store/cart'
import { Product } from '@/lib/types'
import { ArrowLeft, Heart, ShoppingCart, Minus, Plus } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>() ?? {}
  const router = useRouter()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchProduct()
    fetchWishlistStatus()
  }, [id])

  // Always fetch fresh stock from DB — never trust stale local state
  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      const result = await res.json()
      if (result.success) {
        setProduct(result.data)
        // Clamp quantity to available stock
        setQuantity((q) => Math.min(q, result.data.stock || 1))
      } else {
        router.push('/')
      }
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlistStatus = async () => {
    try {
      const res = await fetch('/api/wishlist')
      const result = await res.json()
      if (result.success && Array.isArray(result.data)) {
        const item = result.data.find(
          (w: { product_id: string; id: string }) => w.product_id === id
        )
        if (item) { setIsInWishlist(true); setWishlistItemId(item.id) }
      }
    } catch { /* not logged in */ }
  }

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return
    setAddingToCart(true)
    setCartMessage(null)

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      const result = await res.json()

      if (!result.success) {
        // Stock error from server — re-fetch to get real stock
        setCartMessage(result.error ?? 'Could not add to cart')
        await fetchProduct()
        return
      }

      // Success — update Zustand badge and re-fetch product for real stock
      addItem(product, quantity)
      await fetchProduct()
      setCartMessage('✓ Added to cart!')
      setTimeout(() => setCartMessage(null), 2500)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlist = async () => {
    if (!product) return
    setWishlistError(null)
    setWishlistLoading(true)

    if (isInWishlist && wishlistItemId) {
      const res = await fetch(`/api/wishlist?id=${wishlistItemId}`, { method: 'DELETE' })
      if (res.ok) { setIsInWishlist(false); setWishlistItemId(null) }
    } else {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const result = await res.json()
      if (result.success) {
        setIsInWishlist(true)
        setWishlistItemId(result.data.id)
      } else if (res.status === 401) {
        setWishlistError('Please log in to save items to your wishlist.')
      }
    }
    setWishlistLoading(false)
  }

  if (loading) return <LoadingSpinner />
  if (!product) return null

  // Always read stock directly from product state (re-fetched after every add)
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 5
  const isAdded = cartMessage?.startsWith('✓')
  const isError = cartMessage && !cartMessage.startsWith('✓')

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 hover:underline mb-8">
          <ArrowLeft size={20} />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* ── Image ── */}
          <div className="relative aspect-square bg-amber-100 rounded-2xl overflow-hidden border border-amber-200">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-amber-300 text-lg">No image</span>
              </div>
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-700 text-white font-bold px-6 py-3 text-lg uppercase tracking-widest rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col gap-5">
            {product.category && (
              <span className="text-sm font-semibold text-amber-700 uppercase tracking-widest">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-amber-950">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating value={product.rating} readOnly size={20} />
              <span className="text-sm text-stone-500">
                {product.rating.toFixed(1)} ({product.reviews_count} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-4xl font-bold text-amber-950">${product.price.toFixed(2)}</p>

            {/* Stock status */}
            {outOfStock ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <span className="text-red-700 font-bold text-sm uppercase tracking-wide">
                  ✕ Out of Stock
                </span>
                <span className="text-red-500 text-sm">— This item is currently unavailable</span>
              </div>
            ) : lowStock ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
                <span className="text-amber-700 font-semibold text-sm">
                  ⚠ Only {product.stock} left in stock — order soon
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-700 text-sm font-medium">{product.stock} in stock</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-stone-600 leading-relaxed">{product.description}</p>
            )}

            {/* Quantity selector — hidden when out of stock */}
            {!outOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-stone-700">Quantity</span>
                <div className="flex items-center border-2 border-amber-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-amber-100 transition text-amber-900"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-bold text-amber-950 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-amber-100 transition text-amber-900"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-stone-400">{product.stock} available</span>
              </div>
            )}

            {/* Cart message */}
            {cartMessage && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                isAdded
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {cartMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || addingToCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide border-2 transition-all duration-150
                  ${outOfStock
                    ? 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
                    : isError
                    ? 'border-red-400 bg-red-50 text-red-700 cursor-not-allowed'
                    : 'border-amber-900 bg-amber-800 text-amber-50 shadow-[3px_3px_0px_0px_rgba(69,26,3)] hover:bg-amber-700 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  }`}
              >
                <ShoppingCart size={18} />
                {outOfStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className="px-4 py-3 border-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={22} className={isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-500'} />
              </button>
            </div>

            {wishlistError && (
              <p className="text-sm text-amber-700 bg-amber-100 border border-amber-300 px-3 py-2 rounded">
                {wishlistError}
              </p>
            )}

            <button
              onClick={() => router.push('/cart')}
              className="w-full px-6 py-3 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 shadow-[3px_3px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
            >
              View Cart
            </button>

            <Card className="p-4 bg-amber-100/60 border-amber-200 text-sm text-stone-600 space-y-1.5">
              <p><span className="text-amber-700">✓</span> Secure checkout powered by Stripe</p>
              <p><span className="text-amber-700">✓</span> Order confirmation sent to your email</p>
              <p><span className="text-amber-700">✓</span> Easy returns within 30 days</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
