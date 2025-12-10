import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, BarChart3, Image as ImageIcon, Video } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    // Fetch stats
    const { data: stats } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('mes_referencia', currentMonth)
        .single()

    // Fetch recent products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const scriptsCount = stats?.scripts_gerados || 0
    const mockupsCount = stats?.mockups_gerados || 0
    const videosCount = stats?.videos_gerados || 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
                <Link
                    href="/app/generate"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-primary/20"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Novo Script
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="glass-card overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-muted-foreground truncate">Scripts este mês</dt>
                                <dd>
                                    <div className="text-2xl font-bold text-foreground">{scriptsCount}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ImageIcon className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-muted-foreground truncate">Mockups este mês</dt>
                                <dd>
                                    <div className="text-2xl font-bold text-foreground">{mockupsCount}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Video className="h-6 w-6 text-pink-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-muted-foreground truncate">Vídeos este mês</dt>
                                <dd>
                                    <div className="text-2xl font-bold text-foreground">{videosCount}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div className="glass-card rounded-lg overflow-hidden border border-white/5">
                <div className="px-6 py-5 border-b border-white/10">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Produtos Recentes</h3>
                </div>
                <ul className="divide-y divide-white/5">
                    {!products || products.length === 0 ? (
                        <li className="px-6 py-8 text-center text-muted-foreground">
                            Nenhum produto cadastrado ainda.
                        </li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center truncate">
                                        <div className="flex-shrink-0 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="ml-4 truncate">
                                            <p className="text-sm font-medium text-indigo-400 truncate">{product.nome}</p>
                                            <p className="text-sm text-muted-foreground">{product.segmento || 'Sem segmento'}</p>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <Link href={`/app/products/${product.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Ver detalhes
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                    <div className="text-sm">
                        <Link href="/app/products" className="font-medium text-primary hover:text-primary/80 transition-colors">
                            Ver todos os produtos <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
