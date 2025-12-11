
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { CopyButton } from '@/components/ui/CopyButton'
import { AICommandCenter } from '@/components/dashboard/AICommandCenter'

const formattedKeys: Record<string, string> = {
    esta_caro: "💰 Está Caro",
    nao_tenho_dinheiro: "💸 Sem Dinheiro",
    vou_pensar_sobre: "🤔 Vou Pensar",
    preciso_falar_com_socio_conjuge: "👥 Falar com Sócio/Cônjuge",
    ja_uso_concorrente: "🏢 Concorrente",
    me_manda_por_email: "📧 Manda por Email",
    nao_tenho_tempo: "⏰ Sem Tempo",
    nao_e_o_momento: "📅 Não é o Momento",
    ja_tentei_e_nao_funcionou: "❌ Já Tentei (Frustração)",
    tenho_receio_de_golpe: "🛡️ Medo de Golpe",
    ta_caro: "💰 Está Caro", // variant
    falar_com_socio: "👥 Falar com Sócio", // variant
    concorrente: "🏢 Concorrente", // variant
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) return <div>Produto não encontrado</div>

    const { data: scripts } = await supabase
        .from('scripts')
        .select('*')
        .eq('product_id', id)
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

            {/* Contextual AI Command Center */}
            <div className="mb-8">
                <AICommandCenter
                    initialContext={{
                        id: product.id,
                        name: product.nome,
                        description: product.descricao
                    }}
                />
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
                                <div className="p-4 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Abertura</h4>
                                            <CopyButton text={script.mensagem_abertura} />
                                        </div>
                                        <div className="text-sm text-gray-800 bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
                                            <RichTextRenderer content={script.mensagem_abertura} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Roteiro</h4>
                                            <CopyButton text={script.roteiro_conversa} />
                                        </div>
                                        <div className="text-sm text-gray-800 space-y-2">
                                            <RichTextRenderer content={script.roteiro_conversa} />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Objeções</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {script.respostas_objecoes && Object.entries(script.respostas_objecoes).map(([k, v]) => (
                                                <div key={k} className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-indigo-200 transition-colors group relative">
                                                    <div className="font-semibold text-gray-900 mb-1 flex items-center justify-between pr-6">
                                                        <span>{formattedKeys[k] || k.replace(/_/g, ' ')}</span>
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CopyButton text={v as string} />
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-600 leading-relaxed">
                                                        {v as string}
                                                    </div>
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
