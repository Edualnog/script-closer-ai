import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package, ChevronRight } from 'lucide-react'

export default async function ProductsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {!products || products.length === 0 ? (
                        <li className="px-6 py-10 text-center text-gray-500">
                            Nenhum produto encontrado.
                            <div className="mt-4">
                                <Link href="/dashboard/generate" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                    Gerar primeiro script &rarr;
                                </Link>
                            </div>
                        </li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id}>
                                <Link href={`/dashboard/products/${product.id}`} className="block hover:bg-gray-50">
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1 flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-indigo-600 truncate">{product.nome}</p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500">
                                                        <span className="truncate">{product.description ? product.description.substring(0, 50) + '...' : 'Sem descrição'}</span>
                                                    </p>
                                                </div>
                                                <div className="hidden md:block">
                                                    <div className="text-sm text-gray-900">
                                                        Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Segmento: {product.segmento || 'Geral'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}
