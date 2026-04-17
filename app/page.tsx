'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/products/product-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { CtaButton } from '@/components/ui/cta-button'
import { WorldwideSection } from '@/components/worldwide-section'
import { fadeUp, scaleUp, viewport } from '@/lib/animations'
import { Product, WishlistItem } from '@/lib/types'
import { useCart } from '@/lib/store/cart'
import { Search, X, Star, ShieldCheck, Truck } from 'lucide-react'

// ─── Hero slide images ────────────────────────────────────────────────────────
// Using high-quality Unsplash product lifestyle images
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    alt: 'Premium watch on wrist',
    tag: 'New Arrivals',
  },
  {
    src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    alt: 'Running shoes',
    tag: 'Best Sellers',
  },
  {
    src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    alt: 'Luxury perfume',
    tag: 'Trending Now',
  },
  {
    src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    alt: 'Instant camera',
    tag: 'Top Rated',
  },
]

function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Auto-advance every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % HERO_SLIDES.length)
        setAnimating(false)
      }, 400)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index: number) => {
    if (index === current) return
    setAnimating(true)
    setTimeout(() => { setCurrent(index); setAnimating(false) }, 400)
  }

  return (
    <section className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* ── Left: content ── */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-amber-800/50 border border-amber-700/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full w-fit uppercase tracking-widest">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              Premium Quality Store
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-amber-50">
              Discover Products{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                You'll Love
              </span>
            </h1>

            <TextGenerateEffect
              words="Thousands of curated products at unbeatable prices. Fast shipping, easy returns, and secure checkout."
              className="font-normal max-w-lg"
              textClassName="text-amber-200/80 text-base md:text-lg leading-relaxed"
              duration={0.3}
            />

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 text-sm text-amber-300/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-amber-500" /> Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={15} className="text-amber-500" /> Fast Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={15} className="fill-amber-500 text-amber-500" /> 50K+ Happy Customers
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full max-w-sm sm:max-w-none">
              <CtaButton variant="primary">Shop Now</CtaButton>
              <CtaButton href="/about" variant="outline">Learn More</CtaButton>
            </div>
          </div>

          {/* ── Right: image slideshow ── */}
          <div className="relative flex flex-col items-center gap-4">
            {/* Main image frame */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Decorative frame */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-amber-700/30 to-orange-900/20 blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-700/30 shadow-2xl shadow-amber-950/50 aspect-[4/3]">
                {HERO_SLIDES.map((slide, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-all duration-500 ${
                      i === current
                        ? animating ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    {/* Tag overlay */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-800/90 backdrop-blur-sm text-amber-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-amber-600/40">
                        {slide.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-6 h-2 bg-amber-400'
                        : 'w-2 h-2 bg-amber-700 hover:bg-amber-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating thumbnail strip */}
            <div className="flex gap-2 mt-1">
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    i === current
                      ? 'border-amber-400 scale-110 shadow-lg shadow-amber-900/50'
                      : 'border-amber-800/40 opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={slide.src} alt={slide.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

const CATEGORIES = ['all', 'electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other'] as const

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({})
  const { addItem } = useCart()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)

      const res = await fetch(`/api/products?${params}`)
      const result = await res.json()
      if (result.success) {
        setProducts(result.data?.items ?? result.data ?? [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist')
      const result = await res.json()
      if (result.success && Array.isArray(result.data)) {
        const map: Record<string, string> = {}
        for (const item of result.data as WishlistItem[]) {
          map[item.product_id] = item.id
        }
        setWishlistMap(map)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }, [])

  const refetchAll = useCallback(() => {
    fetchProducts()
    fetchWishlist()
  }, [fetchProducts, fetchWishlist])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchWishlist() }, [fetchWishlist])
  useRefetchOnFocus(refetchAll)

  // Debounce search input → only fires API call 400ms after user stops typing
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(value), 400)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
  }

  const handleAddToCart = async (product: Product, quantity: number) => {
    addItem(product, quantity)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      const result = await res.json()
      if (!result.success) {
        // Stock error — re-fetch to get real stock values
        fetchProducts()
        return
      }
      // Re-fetch products so stock counts update across all cards
      fetchProducts()
    } catch (error) {
      console.error('Error syncing cart to DB:', error)
    }
  }

  const handleAddToWishlist = async (productId: string) => {
    try {
      const existingId = wishlistMap[productId]
      if (existingId) {
        setWishlistMap((prev) => { const n = { ...prev }; delete n[productId]; return n })
        await fetch(`/api/wishlist?id=${existingId}`, { method: 'DELETE' })
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.status === 401) {
          // Not logged in — redirect to login
          window.location.href = '/auth/login?next=/'
          return
        }
        const result = await res.json()
        if (result.success && result.data) {
          setWishlistMap((prev) => ({ ...prev, [productId]: result.data.id }))
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Worldwide Section ── */}
      <WorldwideSection />

      {/* ── Products ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">

        {/* Search bar */}
        <motion.div
          className="relative mb-8"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={fadeUp} custom={0}
        >
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 pr-10 py-6 text-base border-amber-300 bg-white rounded-xl shadow-sm focus:ring-amber-400"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="mb-8"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={fadeUp} custom={0.1}
        >
          <h2 className="text-2xl font-bold text-amber-950 mb-4">Shop by Category</h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                onClick={() => setCategory(cat)}
                className={`capitalize ${
                  category === cat
                    ? 'bg-amber-800 hover:bg-amber-700 text-amber-50 border-amber-800'
                    : 'border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results heading */}
        <motion.div
          className="mb-6"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={fadeUp} custom={0}
        >
          <h2 className="text-2xl font-bold text-amber-950">
            {search
              ? `Results for "${search}"`
              : category === 'all'
              ? 'All Products'
              : `${category.charAt(0).toUpperCase() + category.slice(1)} Products`}
          </h2>
          {!loading && (
            <p className="text-stone-500 text-sm mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          )}
        </motion.div>

        {loading ? (
          <LoadingSpinner fullScreen={false} />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 text-lg mb-4">
              {search
                ? `No products found for "${search}"`
                : 'No products found in this category.'}
            </p>
            {search && (
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial="hidden" whileInView="visible" viewport={viewport}
                variants={scaleUp} custom={i * 0.06}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  isInWishlist={Boolean(wishlistMap[product.id])}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
