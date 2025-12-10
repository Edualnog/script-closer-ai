'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Animated Price Component
function AnimatedPrice({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
        let startTimestamp: number | null = null
        const duration = 500 // ms
        const startValue = displayValue

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)

            // Easing function (easeOutExpo)
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

            const current = startValue + (value - startValue) * ease
            setDisplayValue(current)

            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }

        window.requestAnimationFrame(step)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <span>{displayValue.toFixed(2).replace('.', ',')}</span>
    )
}

export function Pricing() {
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly')

    const isAnnual = billingInterval === 'annually'

    // Monthly prices (Base)
    const priceProMonthly = 49.90
    const priceProPlusMonthly = 129.90

    // Annual prices (Discounted per month)
    const priceProAnnual = 29.90
    const priceProPlusAnnual = 89.90

    // Calculate discount percentage
    const discountPro = Math.round(((priceProMonthly - priceProAnnual) / priceProMonthly) * 100)
    const discountProPlus = Math.round(((priceProPlusMonthly - priceProPlusAnnual) / priceProPlusMonthly) * 100)

    // Current Prices
    const currentProPrice = isAnnual ? priceProAnnual : priceProMonthly
    const currentProPlusPrice = isAnnual ? priceProPlusAnnual : priceProPlusMonthly

    return (
        <section id="pricing" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Planos simples e transparentes</h2>
                    <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                        Escolha o plano ideal para o seu momento de negócio.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center items-center gap-4 mb-16">
                    <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-gray-900" : "text-gray-500")}>
                        Mensalmente
                    </span>
                    <button
                        onClick={() => setBillingInterval(isAnnual ? 'monthly' : 'annually')}
                        className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <div
                            className={cn(
                                "absolute left-1 top-1 w-6 h-6 bg-black rounded-full shadow-sm transition-transform duration-200 ease-in-out",
                                isAnnual ? "translate-x-6" : "translate-x-0"
                            )}
                        />
                    </button>
                    <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-gray-900" : "text-gray-500")}>
                        Anualmente
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                    {/* FREE */}
                    <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        <h3 className="font-semibold text-gray-900 text-xl mb-2">Free</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">R$0</span>
                            <span className="text-gray-500"> / mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                            Para testar rapidamente e sentir o poder da IA.
                        </p>

                        <Link href="/register" className="block w-full py-2.5 rounded-lg bg-[#171717] text-white text-center font-medium hover:bg-gray-800 transition-colors mb-8">
                            Começar
                        </Link>

                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>3 scripts completos por mês</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Identificação do produto pela IA</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Mensagem de abertura</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Roteiro básico</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Objeções limitadas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>1 produto ativo</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Exportação simples</span>
                            </li>
                        </ul>
                    </div>

                    {/* PRO */}
                    <div className="p-8 rounded-2xl border-2 border-[#007AFF] bg-white relative shadow-xl shadow-blue-500/10 transform md:-translate-y-4 z-10 transition-all">
                        {isAnnual && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                                {discountPro}% OFF
                            </div>
                        )}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#007AFF] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-30 tracking-wider">
                            RECOMENDADO
                        </div>

                        <h3 className="font-semibold text-gray-900 text-xl mb-2 mt-2">Pro</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">
                                R$<AnimatedPrice value={currentProPrice} />
                            </span>
                            <span className="text-gray-500"> / mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                            Plano ideal para quem vende todos os dias.
                        </p>

                        <Link href="/register" className="block w-full py-2.5 rounded-lg bg-[#007AFF] text-white text-center font-medium hover:bg-[#0062cc] transition-colors shadow-lg shadow-blue-500/30 mb-8">
                            Começar
                        </Link>

                        <div className="text-xs font-semibold text-[#007AFF] mb-4 uppercase tracking-wider">
                            Tudo do Free +
                        </div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>20 scripts completos por mês</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span className="text-gray-900">Objeções desbloqueadas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>Follow-up automático da IA</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>Memória dos produtos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>Scripts com tom configurável</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>Modelos para WhatsApp e Instagram</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>30 produtos ativos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-[#007AFF] shrink-0" />
                                <span>Suporte prioritário</span>
                            </li>
                        </ul>
                    </div>

                    {/* PRO+ */}
                    <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors relative">
                        {isAnnual && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {discountProPlus}% OFF
                            </div>
                        )}
                        <h3 className="font-semibold text-gray-900 text-xl mb-2">Pro+</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">
                                R$<AnimatedPrice value={currentProPlusPrice} />
                            </span>
                            <span className="text-gray-500"> / mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                            Experiência premium para alto volume.
                        </p>

                        <Link href="/register" className="block w-full py-2.5 rounded-lg bg-[#171717] text-white text-center font-medium hover:bg-gray-800 transition-colors mb-8">
                            Começar
                        </Link>

                        <div className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                            Tudo do Pro +
                        </div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span className="font-medium">Mockups profissionais por IA</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>3 vídeos IA de propaganda</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Scripts ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Produtos ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Versões alternativas de scripts</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Priorização máxima na geração</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Prompt avançado para Meta Ads</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-gray-900 shrink-0" />
                                <span>Biblioteca pessoal de assets</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
