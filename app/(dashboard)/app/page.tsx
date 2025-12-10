import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, BarChart3, Image as ImageIcon, Video } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null // Should be handled by layout

    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    // Fetch stats (Mock/Real)
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
                <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
                <Link
                    href="/app/generate"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Novo Script
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BarChart3 className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Scripts este mês</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{scriptsCount}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Mockups este mês</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{mockupsCount}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Video className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Vídeos este mês</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{videosCount}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Produtos Recentes</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {!products || products.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">
                            Nenhum produto cadastrado ainda.
                        </li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center truncate">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                            {/* Ideally show image/thumbnail if available */}
                                            <ImageIcon className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div className="ml-4 truncate">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{product.nome}</p>
                                            <p className="text-sm text-gray-500">{product.segmento || 'Sem segmento'}</p>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <Link href={`/app/products/${product.id}`} className="text-sm text-gray-500 hover:text-gray-900">
                                            Ver detalhes
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
                    <div className="text-sm">
                        <Link href="/app/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Ver todos os produtos <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
