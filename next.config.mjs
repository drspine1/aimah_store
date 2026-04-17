/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript errors are real errors — don't hide them at build time
  // typescript: { ignoreBuildErrors: true },  ← removed

  images: {
    // Re-enable Next.js image optimisation for better performance.
    // If you serve images from external domains, add them to remotePatterns below.
    // unoptimized: true,  ← removed
    remotePatterns: [
      // Allow any https image host (tighten this per your CDN/storage)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
