'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Product } from '@/lib/types'
import { Plus, Edit2, Trash2, Lock, Upload, X, Search, Star } from 'lucide-react'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'electronics',
  'clothing',
  'books',
  'home',
  'sports',
  'beauty',
  'toys',
  'food',
  'other',
] as const

type Category = typeof CATEGORIES[number] | ''

type ProductFormData = {
  name: string
  description: string
  price: string
  image_url: string
  stock: string
  category: Category
  rating: string
  reviews_count: string
}

const EMPTY_FORM: ProductFormData = {
  name: '', description: '', price: '',
  image_url: '', stock: '', category: '',
  rating: '0', reviews_count: '0',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => { checkAdminAndFetch() }, [])

  // Filter products by search
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.category ?? '').toLowerCase().includes(q) ||
              (p.description ?? '').toLowerCase().includes(q)
          )
        : products
    )
  }, [search, products])

  const checkAdminAndFetch = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.push('/'); return }

      setIsAdmin(true)
      await fetchProducts()
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      const result = await res.json()
      if (result.success) setProducts(result.data?.items ?? result.data ?? [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
  }

  // ── Image handling ──────────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    // Clear the URL field since we're using a file
    setFormData((prev) => ({ ...prev, image_url: '' }))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: false })

      if (error) throw error

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Make sure the "product-images" storage bucket exists in Supabase.')
      return null
    } finally {
      setUploading(false)
    }
  }

  // ── Form submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const imageUrl = await uploadImage()

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: imageUrl ?? '',
      stock: parseInt(formData.stock, 10),
      category: formData.category,
      rating: parseFloat(formData.rating) || 0,
      reviews_count: parseInt(formData.reviews_count, 10) || 0,
    }

    try {
      const res = await fetch('/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...productData } : productData),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      await fetchProducts()
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description ?? '',
      price: product.price.toString(),
      image_url: product.image_url ?? '',
      stock: product.stock.toString(),
      category: (product.category ?? '') as Category,
      rating: product.rating.toString(),
      reviews_count: product.reviews_count.toString(),
    })
    setImagePreview(product.image_url ?? null)
    setImageFile(null)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  const setField = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  if (loading) return <LoadingSpinner />

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <Card className="p-8 text-center border-amber-200">
          <Lock className="w-12 h-12 text-amber-800 mx-auto mb-4" />
          <p className="text-lg font-semibold text-amber-950">Access Denied</p>
          <p className="text-stone-600">Only admins can access this page</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-950">Product Management</h1>
            <p className="text-stone-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders">
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                Orders
              </Button>
            </Link>
            <Button
              onClick={() => { resetForm(); setShowForm((v) => !v) }}
              className="gap-2 bg-amber-800 hover:bg-amber-700 text-amber-50"
            >
              <Plus size={20} />
              Add Product
            </Button>
          </div>
        </div>

        {/* ── Product Form ── */}
        {showForm && (
          <Card className="p-6 mb-8 border-amber-200">
            <h2 className="text-2xl font-bold text-amber-950 mb-6">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <Input
                placeholder="Product Name"
                required
                value={formData.name}
                onChange={setField('name')}
                className="border-amber-300"
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 border border-amber-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={4}
                value={formData.description}
                onChange={setField('description')}
              />

              {/* Price + Stock */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={setField('price')}
                  className="border-amber-300"
                />
                <Input
                  placeholder="Stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={setField('stock')}
                  className="border-amber-300"
                />
              </div>

              {/* Category select */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={setField('category')}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 capitalize"
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Rating + Reviews */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Rating (click to set)
                  </label>
                  <div className="flex items-center gap-3">
                    <StarRating
                      value={parseFloat(formData.rating) || 0}
                      onChange={(r) => setFormData((prev) => ({ ...prev, rating: r.toString() }))}
                      size={24}
                    />
                    <span className="text-sm text-stone-500">
                      {formData.rating || '0'} / 5
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Reviews Count
                  </label>
                  <Input
                    placeholder="e.g. 128"
                    type="number"
                    min="0"
                    value={formData.reviews_count}
                    onChange={setField('reviews_count')}
                    className="border-amber-300"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Product Image</label>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-32 h-32 mb-3">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg border border-amber-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                        setFormData((prev) => ({ ...prev, image_url: '' }))
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 items-center flex-wrap">
                  {/* File upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-amber-800 bg-amber-50 text-amber-900 text-sm font-semibold uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    <Upload size={16} />
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  {/* OR paste URL */}
                  <span className="text-stone-400 text-sm">or</span>
                  <Input
                    placeholder="Paste image URL"
                    value={imageFile ? '' : formData.image_url}
                    onChange={(e) => {
                      setImageFile(null)
                      setImagePreview(e.target.value || null)
                      setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                    }}
                    className="border-amber-300 flex-1 min-w-0"
                  />
                </div>
                {imageFile && (
                  <p className="text-xs text-stone-500 mt-1">
                    Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-amber-800 hover:bg-amber-700 text-amber-50"
                >
                  {uploading ? 'Uploading...' : editingId ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => { setShowForm(false); resetForm() }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ── Search ── */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search products by name, category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-amber-300 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Product list ── */}
        {filtered.length === 0 ? (
          <Card className="p-8 text-center border-amber-200">
            <p className="text-stone-600 text-lg">
              {search ? `No products match "${search}"` : 'No products yet.'}
            </p>
            {!search && (
              <Button onClick={() => setShowForm(true)} className="mt-4 gap-2 bg-amber-800 hover:bg-amber-700 text-amber-50">
                <Plus size={20} /> Create First Product
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((product) => (
              <Card key={product.id} className="p-5 border-amber-200">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-amber-100 border border-amber-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-amber-950 truncate">{product.name}</h3>
                    <p className="text-stone-500 text-sm line-clamp-1 mb-2">{product.description}</p>
                    <div className="flex gap-3 flex-wrap text-sm items-center">
                      <span className="font-bold text-amber-800">${product.price.toFixed(2)}</span>
                      <span className="text-stone-500">Stock: {product.stock}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium capitalize">
                        {product.category}
                      </span>
                      {product.rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 text-xs">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {product.rating.toFixed(1)} ({product.reviews_count})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="gap-1 border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      <Edit2 size={14} /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(product.id)}
                      className="gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* ── Delete confirmation modal ── */}
    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => !deleteLoading && setDeleteId(null)}
        />
        {/* Modal */}
        <div className="relative bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-amber-950/30">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 size={26} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-950 mb-1">Delete Product</h3>
              <p className="text-stone-600 text-sm">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-amber-900">
                  {products.find(p => p.id === deleteId)?.name ?? 'this product'}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-red-700 bg-red-600 text-white transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(153,27,27)] hover:bg-red-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  )
}
