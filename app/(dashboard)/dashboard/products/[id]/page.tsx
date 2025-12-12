import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ScriptFlowView } from '@/components/dashboard/ScriptFlowView'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) return <div className="p-8 text-gray-500">Produto não encontrado</div>

    // Get the latest script for this product
    const { data: scripts } = await supabase
        .from('scripts')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

    const latestScript = scripts?.[0] || null

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Link>

                <h1 className="text-2xl font-semibold text-gray-900 mb-8">{product.nome}</h1>

                {latestScript ? (
                    <ScriptFlowView
                        script={latestScript}
                        productName={product.nome}
                        productId={product.id}
                    />
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 mb-4">Nenhum script gerado para este produto.</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                        >
                            Gerar Script
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
