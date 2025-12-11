import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/dashboard/OnboardingWizard'
import { UserNav } from '@/components/dashboard/UserNav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <MobileNav />
            <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen text-foreground w-full transition-all">
                <div className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>
            <OnboardingWizard userId={user.id} />
            <UserNav />
        </div>
    )
}
