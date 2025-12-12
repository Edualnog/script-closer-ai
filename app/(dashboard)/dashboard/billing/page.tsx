import { createClient } from '@/lib/supabase/server'
import { BillingClient } from '@/components/billing/BillingClient'

export default async function BillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Ensure we have a valid object even if DB record is missing (fallback)
    const secureUser = {
        id: user.id,
        email: user.email!,
        nome: userData?.nome || user.user_metadata?.full_name || null,
        avatar_url: userData?.avatar_url || null,
        plano_atual: userData?.plano_atual || 'free'
    }

    return <BillingClient user={secureUser} />
}
