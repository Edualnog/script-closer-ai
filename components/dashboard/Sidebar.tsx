'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Package, CreditCard, LogOut, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Novo Script', href: '/app/generate', icon: PlusCircle },
    { name: 'Meus Produtos', href: '/app/products', icon: Package },
    { name: 'Planos & Billing', href: '/app/billing', icon: CreditCard },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed">
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
                <span className="text-xl font-bold text-gray-800">ScriptCloser</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 flex-shrink-0 h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex-shrink-0 w-full group block"
                >
                    <div className="flex items-center">
                        <div>
                            <LogOut className="inline-block h-9 w-9 rounded-full text-gray-400 p-1 border border-gray-200" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                Sair
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}
