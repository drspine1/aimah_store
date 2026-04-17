import { useEffect } from 'react'

/**
 * Calls `refetch` whenever the user returns to this browser tab.
 * Skips the call if the page was hidden for less than `minHiddenMs`
 * (default 5 s) to avoid unnecessary requests on quick alt-tabs.
 */
export function useRefetchOnFocus(refetch: () => void, minHiddenMs = 5000) {
  useEffect(() => {
    let hiddenAt: number | null = null

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (
        document.visibilityState === 'visible' &&
        hiddenAt !== null &&
        Date.now() - hiddenAt >= minHiddenMs
      ) {
        refetch()
        hiddenAt = null
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [refetch, minHiddenMs])
}
