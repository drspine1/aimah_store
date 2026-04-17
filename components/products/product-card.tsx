'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Product } from '@/lib/types'
import { Heart, ShoppingCart } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => Promise<void> | void
  onAddToWishlist: (productId: string) => void
  isInWishlist?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const outOfStock = product.stock === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock) return
    setIsLoading(true)
    try {
      await onAddToCart(product, 1)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow border-amber-200 bg-white">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-64 bg-amber-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-50">
              <span className="text-amber-300">No image</span>
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-700 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock badge */}
          {!outOfStock && product.stock < 5 && (
            <div className="absolute top-2 left-2">
              <span className="bg-amber-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              onAddToWishlist(product.id)
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              className={isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-500'}
            />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-amber-950 hover:text-amber-700 transition">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 my-2">
          <StarRating value={product.rating} readOnly size={13} />
          <span className="text-xs text-stone-400">({product.reviews_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg md:text-xl font-bold text-amber-950">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || outOfStock}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 transition-all duration-150
            ${outOfStock
              ? 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'border-amber-900 bg-amber-800 text-amber-50 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
            }`}
        >
          <ShoppingCart size={16} />
          {outOfStock ? 'Out of Stock' : isLoading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Card>
  )
}
