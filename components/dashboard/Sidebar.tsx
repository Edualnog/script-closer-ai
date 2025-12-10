'use client'

import Link from 'next/link'
import { LayoutDashboard, PenTool, Package, CreditCard, LogOut, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Visão Geral', href: '/app', icon: LayoutDashboard },
    { name: 'Gerar Script', href: '/app/generate', icon: PenTool },
    { name: 'Meus Produtos', href: '/app/products', icon: Package },
    { name: 'Planos e Fatura', href: '/app/billing', icon: CreditCard },
]

export function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass border-r border-white/5 px-6 pb-4 w-64 h-screen fixed left-0 top-0">
            <div className="flex h-16 shrink-0 items-center gap-2 mt-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl text-foreground">ScriptCloser</span>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                                    'h-6 w-6 shrink-0'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={handleSignOut}
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 w-full transition-colors"
                        >
                            <LogOut
                                className="h-6 w-6 shrink-0 text-muted-foreground group-hover:text-red-500"
                                aria-hidden="true"
                            />
                            Sair
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
