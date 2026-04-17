import { NextRequest } from 'next/server'
import { requireUser, ok, okEmpty, err } from '@/lib/supabase/api-helpers'

export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', user.id)

  if (error) {
    console.error('Get cart error:', error)
    return err('Failed to fetch cart', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const body = await request.json()
  const productId: string | undefined = body.productId
  const quantity: number | undefined = body.quantity

  if (!productId || typeof quantity !== 'number' || quantity < 1) {
    return err('productId and a positive quantity are required', 400)
  }

  // ── Check stock before adding ─────────────────────────────────────────────
  const { data: product, error: stockError } = await supabase
    .from('products')
    .select('id, stock')
    .eq('id', productId)
    .single()

  if (stockError || !product) return err('Product not found', 404)
  if (product.stock < quantity) {
    return err(
      product.stock === 0 ? 'This product is out of stock' : `Only ${product.stock} unit(s) available`,
      400
    )
  }

  // Upsert: increment quantity if the item already exists
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select('*, product:products(*)')
      .single()

    if (error) {
      console.error('Update cart error:', error)
      return err('Failed to update cart', 500)
    }

    // Decrement stock
    await supabase
      .from('products')
      .update({ stock: product.stock - quantity })
      .eq('id', productId)

    return ok(data)
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert([{ user_id: user.id, product_id: productId, quantity }])
    .select('*, product:products(*)')
    .single()

  if (error) {
    console.error('Add to cart error:', error)
    return err('Failed to add to cart', 500)
  }

  // Decrement stock
  await supabase
    .from('products')
    .update({ stock: product.stock - quantity })
    .eq('id', productId)

  return ok(data, 201)
}

export async function PUT(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const body = await request.json()
  const cartItemId: string | undefined = body.cartItemId
  const quantity: number | undefined = body.quantity

  if (!cartItemId || typeof quantity !== 'number') {
    return err('cartItemId and quantity are required', 400)
  }

  if (quantity <= 0) {
    const { data: item } = await supabase
      .from('cart_items')
      .select('quantity, product_id')
      .eq('id', cartItemId)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete cart item error:', error)
      return err('Failed to remove cart item', 500)
    }

    // Restore stock
    if (item) {
      const { data: prod } = await supabase
        .from('products').select('stock').eq('id', item.product_id).single()
      if (prod) {
        await supabase
          .from('products')
          .update({ stock: prod.stock + item.quantity })
          .eq('id', item.product_id)
      }
    }

    return okEmpty()
  }

  // Updating quantity — calculate the diff to adjust stock
  const { data: currentItem } = await supabase
    .from('cart_items')
    .select('quantity, product_id')
    .eq('id', cartItemId)
    .eq('user_id', user.id)
    .single()

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', user.id)
    .select('*, product:products(*)')
    .single()

  if (error) {
    console.error('Update cart quantity error:', error)
    return err('Failed to update cart', 500)
  }

  // Adjust stock by the difference
  if (currentItem) {
    const diff = currentItem.quantity - quantity // positive = returning stock, negative = taking more
    if (diff !== 0) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock')
        .eq('id', currentItem.product_id)
        .single()
      if (prod) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, prod.stock + diff) })
          .eq('id', currentItem.product_id)
      }
    }
  }

  return ok(data)
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user, supabase } = auth

  const cartItemId = new URL(request.url).searchParams.get('id')
  if (!cartItemId) return err('Cart item ID required', 400)

  // Get item before deleting to restore stock
  const { data: item } = await supabase
    .from('cart_items')
    .select('quantity, product_id')
    .eq('id', cartItemId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete cart error:', error)
    return err('Failed to delete cart item', 500)
  }

  // Restore stock
  if (item) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()
    if (prod) {
      await supabase
        .from('products')
        .update({ stock: prod.stock + item.quantity })
        .eq('id', item.product_id)
    }
  }

  return okEmpty()
}
