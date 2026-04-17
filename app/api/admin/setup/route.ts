/**
 * One-time admin setup endpoint.
 * POST /api/admin/setup
 *
 * Promotes the currently logged-in user to admin.
 * Only works if zero admins exist — permanently disabled after first use.
 *
 * Uses the service-role key to bypass RLS for the profile upsert,
 * which is necessary when the profile row doesn't exist yet.
 */
import { requireUser, ok, err } from '@/lib/supabase/api-helpers'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  const { user } = auth

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceUrl || !serviceKey || serviceKey.includes('replace_me')) {
    return err(
      'SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. ' +
      'Get it from Supabase Dashboard → Settings → API → service_role key.',
      500
    )
  }

  const service = createServiceClient(serviceUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // Check if any admin already exists
  const { count, error: countError } = await service
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_admin', true)

  if (countError) {
    return err('Setup check failed: ' + countError.message, 500)
  }

  if (count && count > 0) {
    return err(
      'An admin already exists. This setup endpoint is permanently disabled.',
      403
    )
  }

  // Upsert the profile — creates it if missing, sets is_admin = true
  const { error: upsertError } = await service
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email, is_admin: true },
      { onConflict: 'id' }
    )

  if (upsertError) {
    return err('Failed to promote to admin: ' + upsertError.message, 500)
  }

  return ok({
    message: `${user.email} is now admin. This endpoint is permanently disabled.`,
  })
}
