'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Copy, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'

export default function GeneratePage() {
    const [loading, setLoading] = useState(false)
    const [userPlan, setUserPlan] = useState('free')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        context: 'WhatsApp',
        leadType: 'morno',
    })
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function loadPlan() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('users').select('plano_atual').eq('id', user.id).single()
                if (data) setUserPlan(data.plano_atual)
            }
        }
        loadPlan()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao gerar script')
            }

            setResult(data.result)
            router.refresh() // Update sidebar/usage stats potentially
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copiado!')
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Script de Vendas</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nome do Produto/Serviço</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
                            <textarea
                                rows={3}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Tênis de corrida com amortecimento extra, ideal para maratonas..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Canal de Venda</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.context}
                                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                            >
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Instagram DM">Instagram DM</option>
                                <option value="Ligação">Ligação Telefônica</option>
                                <option value="Email">Email</option>
                                <option value="Presencial">Presencial / Loja</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Lead</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.leadType}
                                onChange={(e) => setFormData({ ...formData, leadType: e.target.value as any })}
                            >
                                <option value="frio">Frio (Não conhece a marca)</option>
                                <option value="morno">Morno (Já interagiu)</option>
                                <option value="quente">Quente / Qualificado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Gerando...
                                </>
                            ) : (
                                'Gerar Script com IA'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Display */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Abertura */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Mensagem de Abertura</h3>
                            <button
                                onClick={() => copyToClipboard(result.mensagem_abertura)}
                                className="text-gray-400 hover:text-indigo-600"
                            >
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md text-gray-800 whitespace-pre-wrap">
                            {result.mensagem_abertura}
                        </div>
                    </div>

                    {/* Roteiro */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Roteiro de Conversa</h3>
                            <button
                                onClick={() => copyToClipboard(result.roteiro_conversa)}
                                className="text-gray-400 hover:text-indigo-600"
                            >
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md text-gray-800 whitespace-pre-wrap">
                            {result.roteiro_conversa}
                        </div>
                    </div>

                    {/* Objeções */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quebra de Objeções</h3>
                        <div className="space-y-4">
                            {result.respostas_objecoes && Object.entries(result.respostas_objecoes).map(([key, value], index) => {
                                // If Free plan, lock after 1st objection or blur content
                                // Requirement: "ver algumas... mas com limitação visual"
                                // Let's show first one fully, others blurred for Free.
                                const isLocked = userPlan === 'free' && index > 0
                                const content = value as string

                                return (
                                    <div key={key} className="border border-gray-200 rounded-md p-4 relative overflow-hidden">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                                            {key.replace(/_/g, ' ')}
                                        </h4>

                                        <div className={isLocked ? 'blur-sm select-none' : ''}>
                                            <p className="text-gray-800">{isLocked ? 'Lorem ipsum resposta bloqueada para usuários free. Faça upgrade para ver tudo.' : content}</p>
                                        </div>

                                        {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                                                <Link href="/app/billing" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm">
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    Desbloquear no Pro
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Follow Up */}
                    {result.follow_up && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Sugestões de Follow-up</h3>
                            <ul className="space-y-3">
                                {(result.follow_up as string[]).map((msg, i) => (
                                    <li key={i} className="bg-gray-50 p-3 rounded border border-gray-100 text-gray-700">
                                        <span className="font-bold text-xs text-indigo-500 block mb-1">Opção {i + 1}</span>
                                        {msg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
