import { createClient } from '@/lib/supabase/server'
import BulkMessaging from '@/components/dashboard/BulkMessaging'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <BulkMessaging />
    )
}
