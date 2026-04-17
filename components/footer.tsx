'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'
import { Logo } from '@/components/ui/logo'
import { fadeUp, fadeLeft, viewport } from '@/lib/animations'
import { ShoppingBag, Heart, Package, ShieldCheck, Mail, Github, Twitter } from 'lucide-react'

const SHOP_LINKS = [
  { label: 'All Products', href: '/' },
  { label: 'Electronics', href: '/?category=electronics' },
  { label: 'Clothing', href: '/?category=clothing' },
  { label: 'Books', href: '/?category=books' },
  { label: 'Home & Garden', href: '/?category=home' },
]

const ACCOUNT_LINKS = [
  { label: 'My Orders', href: '/orders' },
  { label: 'Wishlist', href: '/' },
  { label: 'Cart', href: '/cart' },
  { label: 'Account Settings', href: '/account' },
]

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/about' },
  { label: 'Privacy Policy', href: '/about' },
  { label: 'Terms of Service', href: '/about' },
]

const FEATURES = [
  { icon: ShoppingBag, label: 'Curated Products' },
  { icon: ShieldCheck, label: 'Secure Checkout' },
  { icon: Package, label: 'Fast Delivery' },
  { icon: Heart, label: '30-Day Returns' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1a0a02]">
      {/* Grid texture */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 select-none',
          '[background-size:40px_40px]',
          '[background-image:linear-gradient(to_right,#2a1005_1px,transparent_1px),linear-gradient(to_bottom,#2a1005_1px,transparent_1px)]'
        )}
      />

      {/* Spotlight — warm amber tint, top-left */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-40"
        fill="#d97706"
      />
      {/* Spotlight — mirrored, top-right */}
      <Spotlight
        className="-top-40 right-0 md:-top-20 md:right-40 scale-x-[-1]"
        fill="#d97706"
      />

      {/* Content */}
      <div className="relative z-10">

        {/* ── Top: feature strip ── */}
        <div className="border-b border-amber-900/40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-3"
                  initial="hidden" whileInView="visible" viewport={viewport}
                  variants={fadeUp} custom={i * 0.1}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-800/30 border border-amber-700/30 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-amber-200">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main footer columns ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 gap-10"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeLeft} custom={0}
          >

            {/* Brand column */}
            <div className="md:col-span-2 space-y-5">
              <Logo className="brightness-110" />
              <p className="text-amber-200/70 text-sm leading-relaxed max-w-xs">
                Your destination for premium products at unbeatable prices.
                Shop with confidence — every purchase is backed by our
                30-day return guarantee.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { icon: Twitter, label: 'Twitter', href: '#' },
                  { icon: Github, label: 'GitHub', href: '#' },
                  { icon: Mail, label: 'Email', href: 'mailto:hello@store.co' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-amber-800/30 border border-amber-700/30 flex items-center justify-center text-amber-400 hover:bg-amber-700/40 hover:text-amber-300 transition"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-amber-300 font-semibold text-sm uppercase tracking-widest mb-4">
                Shop
              </h3>
              <ul className="space-y-3">
                {SHOP_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-amber-200/60 text-sm hover:text-amber-300 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-amber-300 font-semibold text-sm uppercase tracking-widest mb-4">
                Account
              </h3>
              <ul className="space-y-3">
                {ACCOUNT_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-amber-200/60 text-sm hover:text-amber-300 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-amber-300 font-semibold text-sm uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {COMPANY_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-amber-200/60 text-sm hover:text-amber-300 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-amber-900/40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-amber-200/40 text-xs">
              © {new Date().getFullYear()} store·co. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-amber-200/40 text-xs">Payments secured by</span>
              <span className="text-amber-400 text-xs font-bold tracking-wide">STRIPE</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
