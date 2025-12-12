import { createClient } from '@/lib/supabase/server'
import { AICommandCenter } from '@/components/dashboard/AICommandCenter'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <AICommandCenter />
    )
}
