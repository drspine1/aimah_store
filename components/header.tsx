'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useCart } from '@/lib/store/cart'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  // Suppress cart badge on SSR — Zustand localStorage state is only
  // available after hydration, so we wait for mount to avoid mismatch.
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async (userId: string | undefined) => {
      if (!userId) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
      setIsAdmin(data?.is_admin ?? false)
    }

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      checkUser(data.user?.id).finally(() => setLoading(false))
    })

    // Keep in sync with auth state changes (login / logout in other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        checkUser(session?.user?.id)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()   // fires onAuthStateChange → clears user state
    setUser(null)
    setIsAdmin(false)
    setMobileMenuOpen(false)
    // Hard navigate so the server session cookie is also cleared via middleware
    window.location.href = '/auth/login'
  }

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-amber-700 transition">
              Home
            </Link>
            <Link href="/orders" className="hover:text-amber-700 transition">
              Orders
            </Link>
            {isAdmin && (
              <Link href="/admin/products" className="hover:text-amber-700 transition font-medium text-amber-800">
                Products
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/orders" className="hover:text-amber-700 transition font-medium text-amber-800">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-amber-100 rounded-lg transition"
              aria-label="Cart"
            >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 hover:text-amber-700"
                  >
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-4">
            <Link
              href="/"
              className="block hover:text-amber-700 transition py-2"
              onClick={closeMobile}
            >
              Home
            </Link>
            <Link
              href="/orders"
              className="block hover:text-amber-700 transition py-2"
              onClick={closeMobile}
            >
              Orders
            </Link>
            {isAdmin && (
              <Link
                href="/admin/products"
                className="block hover:text-amber-700 transition py-2 font-medium text-amber-800"
                onClick={closeMobile}
              >
                Admin — Products
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/orders"
                className="block hover:text-amber-700 transition py-2 font-medium text-amber-800"
                onClick={closeMobile}
              >
                Admin — Dashboard
              </Link>
            )}
            <Link
              href="/cart"
              className="flex items-center gap-2 hover:text-amber-700 transition py-2"
              onClick={closeMobile}
            >
              <ShoppingCart size={20} />
              Cart
              {mounted && totalItems > 0 && (
                <span className="bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {!loading && (
              <div className="border-t pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="py-2 text-sm text-stone-700">{user.email}</div>
                    <Link href="/account" className="block" onClick={closeMobile}>
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        <User size={16} />
                        Account
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block" onClick={closeMobile}>
                      <button className="w-full px-5 py-2 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-50 text-amber-900 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/sign-up" className="block" onClick={closeMobile}>
                      <button className="w-full px-5 py-2 text-sm font-semibold uppercase tracking-wide border-2 border-amber-900 bg-amber-800 text-amber-50 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(69,26,3)] hover:bg-amber-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
