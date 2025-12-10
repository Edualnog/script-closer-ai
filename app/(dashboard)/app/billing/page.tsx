import { createClient } from '@/lib/supabase/server'
import { Check } from 'lucide-react'

export default async function BillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('plano_atual')
        .eq('id', user.id)
        .single()

    const currentPlan = userData?.plano_atual || 'free'

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Planos e Faturamento</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900">Seu Plano Atual</h2>
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-3xl font-bold text-indigo-600 uppercase">{currentPlan.replace('_', ' ')}</span>
                        <p className="text-gray-500 mt-1">
                            {currentPlan === 'free' ? 'Plano Gratuito Limitado' : 'Assinatura Ativa'}
                        </p>
                    </div>
                    {currentPlan === 'free' ? (
                        <button
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled // Mock implementation
                        >
                            Fazer Upgrade
                        </button>
                    ) : (
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200">
                            Gerenciar Assinatura (Portal)
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comparativo</h3>
                {/* Reuse Pricing Component Logic here or keep simple */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free */}
                    <div className={`border rounded-lg p-4 ${currentPlan === 'free' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                        <h4 className="font-bold text-gray-900">Free</h4>
                        <p className="text-gray-500">R$ 0/mês</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>3 scripts/mês</li>
                            <li>Objeções limitadas</li>
                        </ul>
                    </div>
                    {/* Pro */}
                    <div className={`border rounded-lg p-4 ${currentPlan === 'pro' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                        <h4 className="font-bold text-gray-900">Pro</h4>
                        <p className="text-gray-500">R$ 39,90/mês</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>20 scripts/mês</li>
                            <li>Objeções ilimitadas</li>
                            <li>Memória detalhada</li>
                        </ul>
                    </div>
                    {/* Pro+ */}
                    <div className={`border rounded-lg p-4 ${currentPlan === 'pro_plus' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                        <h4 className="font-bold text-gray-900">Pro+</h4>
                        <p className="text-gray-500">R$ 89,90/mês</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>Tudo do Pro</li>
                            <li>Mockups IA</li>
                            <li>Vídeos Veo 3</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
