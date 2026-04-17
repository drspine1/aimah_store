import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

// ─── Site-wide constants ──────────────────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'store·co'
const SITE_DESCRIPTION =
  'Discover thousands of premium products at unbeatable prices. Fast shipping, easy returns, and secure checkout powered by Stripe.'

// ─── Viewport ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: '#92400e',
  width: 'device-width',
  initialScale: 1,
}

// ─── Root metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ── Title template ──
  title: {
    default: `${SITE_NAME} — Premium Products`,
    template: `%s | ${SITE_NAME}`,
  },

  // ── Description ──
  description: SITE_DESCRIPTION,

  // ── Keywords ──
  keywords: [
    'online store', 'premium products', 'electronics', 'clothing',
    'books', 'home goods', 'fast shipping', 'secure checkout',
  ],

  // ── Authors / creator ──
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Canonical ──
  alternates: { canonical: '/' },

  // ── Open Graph ──
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Products`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',   // place a 1200×630 image here for social previews
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Premium Products`,
      },
    ],
  },

  // ── Twitter / X card ──
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Premium Products`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@storeco',
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Icons — our custom store·co logo, no v0 branding ──
  icons: {
    icon: [
      { url: '/icon.svg',  type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },

  // ── Manifest ──
  manifest: '/site.webmanifest',
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon.svg`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?search={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
