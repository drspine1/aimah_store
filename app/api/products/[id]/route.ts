import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ok, err } from '@/lib/supabase/api-helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return err('Product not found', 404)
    console.error('Get product error:', error)
    return err('Failed to fetch product', 500)
  }

  return ok(data)
}
