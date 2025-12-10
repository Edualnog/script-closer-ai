import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Copy } from 'lucide-react'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!product) return <div>Produto não encontrado</div>

    const { data: scripts } = await supabase
        .from('scripts')
        .select('*')
        .eq('product_id', params.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <Link href="/app/products" className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{product.nome}</h1>
                <p className="mt-1 text-gray-500">{product.descricao}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Scripts Gerados</h2>

                <div className="space-y-6">
                    {!scripts || scripts.length === 0 ? (
                        <p className="text-gray-500">Nenhum script salvo para este produto.</p>
                    ) : (
                        scripts.map((script) => (
                            <div key={script.id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-indigo-600 flex items-center">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        {script.tipo_lead} - {script.canal_venda}
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Gerado em {new Date(script.created_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Abertura</h4>
                                        <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-2 rounded">{script.mensagem_abertura}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Roteiro</h4>
                                        <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{script.roteiro_conversa}</div>
                                    </div>
                                    {/* Could expand Objections/Followup here too */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Objeções</h4>
                                        <div className="mt-1 grid grid-cols-1 gap-2">
                                            {script.respostas_objecoes && Object.entries(script.respostas_objecoes).map(([k, v]) => (
                                                <div key={k} className="text-sm bg-gray-50 p-2 rounded">
                                                    <span className="font-semibold">{k}:</span> {v as string}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
