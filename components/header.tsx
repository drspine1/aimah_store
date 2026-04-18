'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useCart } from '@/lib/store/cart'
import { ShoppingCart, User, LogOut, Menu, X, Home, Package, LayoutDashboard, ShoppingBag } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async (userId: string | undefined) => {
      if (!userId) { setIsAdmin(false); return }
      const { data } = await supabase
        .from('profiles').select('is_admin').eq('id', userId).single()
      setIsAdmin(data?.is_admin ?? false)
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      checkUser(data.user?.id).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        checkUser(session?.user?.id)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setMobileMenuOpen(false)
    window.location.href = '/auth/login'
  }

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="hover:text-amber-700 transition">Home</Link>
              <Link href="/orders" className="hover:text-amber-700 transition">Orders</Link>
              {isAdmin && (
                <Link href="/admin/products" className="hover:text-amber-700 transition font-medium text-amber-800">Products</Link>
              )}
              {isAdmin && (
                <Link href="/admin/orders" className="hover:text-amber-700 transition font-medium text-amber-800">Dashboard</Link>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/cart" className="relative p-2 hover:bg-amber-100 rounded-lg transition" aria-label="Cart">
                <ShoppingCart size={24} />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/account">
                      <Button variant="ghost" size="sm" className="gap-2 hover:text-amber-700">
                        <User size={20} />
                        {user.email?.split('@')[0]}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:text-amber-700">
                      <LogOut size={20} />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/auth/login">
                      <button className="px-5 py-1.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <button className="px-5 py-1.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-800 text-amber-50 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Mobile: cart badge + hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <Link href="/cart" className="relative p-2 hover:bg-amber-100 rounded-lg transition" aria-label="Cart">
                <ShoppingCart size={22} />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-amber-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                className="p-2 hover:bg-amber-100 rounded-lg transition"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-amber-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200">
          <Logo />
          <button
            onClick={closeMobile}
            className="p-2 hover:bg-amber-100 rounded-lg transition"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
          {[
            { href: '/',       label: 'Home',   icon: Home },
            { href: '/orders', label: 'Orders', icon: ShoppingBag },
            { href: '/cart',   label: 'Cart',   icon: ShoppingCart, badge: mounted && totalItems > 0 ? totalItems : null },
          ].map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMobile}
              className="flex items-center justify-end gap-3 px-3 py-3 rounded-xl hover:bg-amber-100 text-amber-950 font-medium transition text-right"
            >
              {badge && (
                <span className="bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge}
                </span>
              )}
              {label}
              <Icon size={18} className="text-amber-700" />
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3 text-right">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Admin</p>
              </div>
              <Link href="/admin/products" onClick={closeMobile}
                className="flex items-center justify-end gap-3 px-3 py-3 rounded-xl hover:bg-amber-100 text-amber-800 font-medium transition">
                Products
                <Package size={18} className="text-amber-700" />
              </Link>
              <Link href="/admin/orders" onClick={closeMobile}
                className="flex items-center justify-end gap-3 px-3 py-3 rounded-xl hover:bg-amber-100 text-amber-800 font-medium transition">
                Dashboard
                <LayoutDashboard size={18} className="text-amber-700" />
              </Link>
            </>
          )}
        </nav>

        {/* Auth section at the bottom */}
        <div className="px-5 py-5 border-t border-amber-200 space-y-3">
          {!loading && (
            user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-amber-100 rounded-xl">
                  <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-950 truncate">{user.email?.split('@')[0]}</p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/account" className="block" onClick={closeMobile}>
                  <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-none">
                    <User size={16} />
                    Account
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block" onClick={closeMobile}>
                  <button className="w-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    Login
                  </button>
                </Link>
                <Link href="/auth/sign-up" className="block" onClick={closeMobile}>
                  <button className="w-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-800 text-amber-50 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    Sign Up
                  </button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </>
  )
}
