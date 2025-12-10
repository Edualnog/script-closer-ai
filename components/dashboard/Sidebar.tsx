'use client'

import Link from 'next/link'
import { PlusCircle, Search, Library, Settings, LogOut, Sparkles, Folder, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

// Main navigation
const mainNavigation = [
    { name: 'Novo script', href: '/app', icon: PlusCircle },
    { name: 'Pesquisar', href: '/app/search', icon: Search }, // Placeholder route
    { name: 'Biblioteca', href: '/app/products', icon: Library },
]

export function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        // Fetch recent products for the sidebar list
        const fetchProjects = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('products')
                .select('id, nome')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) setProjects(data)
        }
        fetchProjects()
    }, [supabase])

    const handleSignOut = async () => {
        localStorage.removeItem('pending_script_generation')
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50/50 border-r border-gray-200 px-4 pb-4 w-64 h-screen fixed left-0 top-0 z-50 pt-6">

            {/* Logo/Brand */}
            <div className="flex items-center gap-2 px-2 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-gray-900 tracking-tight">ScriptCloser</span>
            </div>

            {/* Main Action Button */}
            <Link
                href="/app/generate"
                className="mx-2 mb-2 flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span>Nova tarefa</span>
            </Link>

            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-6">

                    {/* Primary Nav */}
                    <li>
                        <ul role="list" className="-mx-2 space-y-0.5">
                            {mainNavigation.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-white text-black shadow-sm border border-gray-200/50'
                                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-500',
                                                    'h-4 w-4 shrink-0'
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

                    {/* Projects / Products List */}
                    <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider px-2 mb-2 flex justify-between items-center group">
                            Projetos
                            <Link href="/app/generate" className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-600">
                                <Plus className="w-3 h-3" />
                            </Link>
                        </div>
                        <ul role="list" className="-mx-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                            {projects.length === 0 ? (
                                <div className="px-2 py-4 text-xs text-center text-gray-400 border border-dashed border-gray-200 rounded-md mx-2">
                                    Sem projetos
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <li key={project.id}>
                                        <Link
                                            href={`/app/products/${project.id}`}
                                            className={cn(
                                                pathname === `/app/products/${project.id}`
                                                    ? 'bg-white text-black shadow-sm border border-gray-200/50'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all truncate'
                                            )}
                                        >
                                            <Folder className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-400" />
                                            <span className="truncate">{project.nome}</span>
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </li>

                    {/* Footer Actions */}
                    <li className="mt-auto">
                        <Link
                            href="/app/billing"
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors mb-1"
                        >
                            <Settings className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-gray-500" />
                            Planos e Fatura
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
                        >
                            <LogOut
                                className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-600"
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
