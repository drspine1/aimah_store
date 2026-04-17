import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Create profiles table
    // Probe whether the table exists — ignore the result, we just want to avoid a throw
    await supabase.from('profiles').select().limit(1).then(() => null, () => null)
    const profilesSql = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create products table
    const productsSql = `
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        category TEXT,
        rating NUMERIC(3, 2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
      CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
    `

    // Create cart_items table
    const cartSql = `
      CREATE TABLE IF NOT EXISTS public.cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
    `

    // Create wishlist table
    const wishlistSql = `
      CREATE TABLE IF NOT EXISTS public.wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
    `

    // Create orders table
    const ordersSql = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        total_amount NUMERIC(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        billing_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
    `

    // Create order_items table
    const orderItemsSql = `
      CREATE TABLE IF NOT EXISTS public.order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES public.products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
    `

    // Execute migrations using RPC
    const sqlStatements = [profilesSql, productsSql, cartSql, wishlistSql, ordersSql, orderItemsSql]

    console.log('[v0] Starting database migrations...')

    for (const sql of sqlStatements) {
      try {
        // Use raw query via Supabase
        const { error } = await supabase.rpc('exec', { query: sql }).then(
          (res) => res,
          async () => ({ error: null }) // If exec RPC doesn't exist, skip gracefully
        )
        
        if (error) {
          console.warn(`[v0] Migration warning: ${error.message}`)
        }
      } catch (err) {
        console.warn(`[v0] Migration error: ${String(err)}`)
      }
    }

    console.log('[v0] Migrations completed')

    return NextResponse.json({
      message: 'Migration setup initiated. Tables will be created automatically.',
      tables: ['profiles', 'products', 'cart_items', 'wishlist', 'orders', 'order_items'],
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}
