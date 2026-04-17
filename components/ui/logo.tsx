/**
 * StoreCo — brand logo
 *
 * Icon mark: an abstract "S" formed by two stacked arcs that also
 * suggest a shopping bag handle — unique, geometric, memorable.
 * Wordmark: "store" in tight tracking with a chocolate/amber palette.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* ── Icon mark ── */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer rounded square background */}
        <rect width="36" height="36" rx="9" fill="#92400e" />

        {/*
          The mark: two offset arcs that together read as an "S"
          and also evoke a shopping bag handle.
          Top arc — cream, sweeps left-to-right across the upper half.
          Bottom arc — amber, sweeps right-to-left across the lower half.
        */}

        {/* Top arc (cream) */}
        <path
          d="M9 15 C9 9, 27 9, 27 15"
          stroke="#fef3c7"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Vertical connector dot — gives the S its spine */}
        <circle cx="18" cy="18" r="2.2" fill="#fbbf24" />

        {/* Bottom arc (amber) */}
        <path
          d="M27 21 C27 27, 9 27, 9 21"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small accent dot top-right — like the Amazon smile dot */}
        <circle cx="27" cy="11" r="2" fill="#fbbf24" />
      </svg>

      {/* ── Wordmark ── */}
      <span
        style={{
          fontFamily: 'Geist, system-ui, sans-serif',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
        className="hidden sm:inline-flex items-baseline gap-[1px]"
      >
        {/* "store" in chocolate */}
        <span className="text-xl font-black text-amber-950 tracking-tight">
          store
        </span>
        {/* Superscript amber dot — like the Google "G" colour accent */}
        <span
          className="text-amber-500 font-black"
          style={{ fontSize: '1.4rem', lineHeight: 1, marginBottom: '2px' }}
        >
          ·
        </span>
        {/* "co" lighter weight */}
        <span className="text-lg font-semibold text-amber-700 tracking-tight">
          co
        </span>
      </span>
    </span>
  )
}
