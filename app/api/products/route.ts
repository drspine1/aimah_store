import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'

const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10) || 12)
  )

  let query = supabase.from('products').select('*', { count: 'exact' })

  if (category && category !== 'all') query = query.eq('category', category)

  const min = minPrice ? parseFloat(minPrice) : NaN
  const max = maxPrice ? parseFloat(maxPrice) : NaN
  if (!isNaN(min)) query = query.gte('price', min)
  if (!isNaN(max)) query = query.lte('price', max)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Products API error:', error)
    return err('Failed to fetch products', 500)
  }

  return ok({ items: data ?? [], total: count ?? 0, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  // Verify admin role server-side
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return err('Forbidden', 403)

  const body = await request.json()
  const { name, description, price, image_url, stock, category } = body as {
    name?: string
    description?: string
    price?: number
    image_url?: string
    stock?: number
    category?: string
  }

  if (!name || typeof price !== 'number' || price < 0) {
    return err('name and a non-negative price are required', 400)
  }
  if (typeof stock !== 'number' || stock < 0) {
    return err('stock must be a non-negative number', 400)
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price, image_url, stock, category }])
    .select()
    .single()

  if (error) {
    console.error('Create product error:', error)
    return err('Failed to create product', 500)
  }

  return ok(data, 201)
}

// Admin: update a product
export async function PUT(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return err('Forbidden', 403)

  const body = await request.json()
  const { id, ...fields } = body as { id?: string; [key: string]: unknown }

  if (!id) return err('Product ID is required', 400)

  const { data, error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update product error:', error)
    return err('Failed to update product', 500)
  }

  return ok(data)
}

// Admin: delete a product
export async function DELETE(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return err('Forbidden', 403)

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return err('Product ID is required', 400)

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('Delete product error:', error)
    return err('Failed to delete product', 500)
  }

  return ok({ id })
}
