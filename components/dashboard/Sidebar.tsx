'use client'

import Link from 'next/link'
import { PlusCircle, Search, Library, Sparkles, Folder, Plus, Home, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SidebarContentProps {
    className?: string;
    onClose?: () => void;
}

export function SidebarContent({ className, onClose }: SidebarContentProps) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [projects, setProjects] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchProjects = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('products')
                .select('id, nome')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) setProjects(data)
        }

        fetchProjects()

        // Realtime Subscription
        const channel = supabase
            .channel('sidebar_products_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to Insert and Update
                    schema: 'public',
                    table: 'products'
                },
                (payload) => {
                    // Refresh data on any change
                    fetchProjects()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    // Listen for optimistic updates from GeneratePage
    useEffect(() => {
        const handleNewProject = (e: CustomEvent) => {
            const newProject = e.detail;
            setProjects(prev => {
                // Avoid duplicates if realtime catches up fast
                if (prev.some(p => p.id === newProject.id)) return prev;
                return [newProject, ...prev];
            });
        };

        window.addEventListener('project_created', handleNewProject as EventListener);
        return () => {
            window.removeEventListener('project_created', handleNewProject as EventListener);
        };
    }, []);

    const handleSignOut = async () => {
        localStorage.removeItem('pending_script_generation')
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const filteredProjects = projects.filter(p =>
        p.nome.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleLinkClick = () => {
        if (onClose) onClose();
    }

    return (
        <div className={cn("flex grow flex-col overflow-y-auto bg-gray-50/50 border-r border-gray-200 px-4 pb-4 pt-6 h-full", className)}>
            <Link
                href="/app"
                onClick={handleLinkClick}
                className="flex items-center gap-2 px-2 mb-6 hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-gray-900 tracking-tight">ScriptCloser</span>
            </Link>

            <Link
                href="/app"
                onClick={handleLinkClick}
                className="mx-2 mb-2 flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span>Novo Script</span>
            </Link>

            <nav className="flex flex-1 flex-col mt-1">
                <ul role="list" className="flex flex-1 flex-col gap-y-4">
                    <li className="px-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </li>

                    <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider px-2 mb-2 flex justify-between items-center group">
                            <Link href="/app/products" onClick={handleLinkClick} className="hover:text-gray-600 transition-colors">
                                SCRIPTS
                            </Link>
                            <Link href="/app" onClick={handleLinkClick} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-600">
                                <Plus className="w-3 h-3" />
                            </Link>
                        </div>
                        <ul role="list" className="-mx-2 space-y-0.5 max-h-[400px] overflow-y-auto">
                            {filteredProjects.length === 0 ? (
                                <div className="px-2 py-4 text-xs text-center text-gray-400 border border-dashed border-gray-200 rounded-md mx-2">
                                    {searchQuery ? "Nenhum resultado" : "Sem projetos"}
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <li key={project.id}>
                                        <Link
                                            href={`/app/products/${project.id}`}
                                            onClick={handleLinkClick}
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


                </ul>
            </nav>
        </div>
    )
}

export function Sidebar() {
    return (
        <div className="hidden lg:flex w-64 h-screen fixed left-0 top-0 z-50">
            <SidebarContent />
        </div>
    )
}
