import Link from 'next/link'
import { Check } from 'lucide-react'

const features = {
    free: [
        '3 scripts por mês',
        'Mensagem de abertura',
        'Roteiro básico',
        'Visualização parcial de objeções',
    ],
    pro: [
        '20 scripts por mês',
        'Tudo do Free desbloqueado',
        'Todas objeções e respostas',
        'Memória de produtos',
        'Sugestões de Follow-up',
        'Tags de segmento',
    ],
    pro_plus: [
        'Tudo do Plano Pro',
        'Mockups de Produto com IA (10/mês)',
        'Vídeos de Propaganda (Veo 3) (3/mês per product)',
        'Suporte Prioritário',
    ],
}

export function Pricing() {
    return (
        <div className="bg-gray-100 py-12" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Planos para todos os tamanhos
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Escolha o plano ideal para acelerar suas vendas.
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {/* FREE PLAN */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
                            <p className="mt-4 text-sm text-gray-500">Para testar o poder da IA.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$0</span>
                                <span className="text-base font-medium text-gray-500">/mês</span>
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 block w-full bg-indigo-50 border border-indigo-200 rounded-md py-2 text-sm font-semibold text-indigo-700 text-center hover:bg-indigo-100"
                            >
                                Começar Grátis
                            </Link>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que inclui</h4>
                            <ul className="mt-6 space-y-4">
                                {features.free.map((feature) => (
                                    <li key={feature} className="flex space-x-3">
                                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                                        <span className="text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* PRO PLAN */}
                    <div className="border border-indigo-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white ring-2 ring-indigo-500 relative">
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-20 rounded-full bg-indigo-500 text-white text-xs font-bold px-2 py-1 text-center">
                            Popular
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
                            <p className="mt-4 text-sm text-gray-500">Para vendedores profissionais.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$39,90</span>
                                <span className="text-base font-medium text-gray-500">/mês</span>
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
                            >
                                Teste Grátis
                            </Link>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que inclui</h4>
                            <ul className="mt-6 space-y-4">
                                {features.pro.map((feature) => (
                                    <li key={feature} className="flex space-x-3">
                                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                                        <span className="text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* PRO+ PLAN */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Pro+</h3>
                            <p className="mt-4 text-sm text-gray-500">Aceleração total com Mídia IA.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$89,90</span>
                                <span className="text-base font-medium text-gray-500">/mês</span>
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 block w-full bg-indigo-50 border border-indigo-200 rounded-md py-2 text-sm font-semibold text-indigo-700 text-center hover:bg-indigo-100"
                            >
                                Assinar Pro+
                            </Link>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que inclui</h4>
                            <ul className="mt-6 space-y-4">
                                {features.pro_plus.map((feature) => (
                                    <li key={feature} className="flex space-x-3">
                                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                                        <span className="text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
