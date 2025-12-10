"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PricingProps {
    onSelectPlan: (plan: string) => void;
    onClose: () => void;
}

export function PostSignupPricing({ onSelectPlan, onClose }: PricingProps) {
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('annually');
    const isAnnual = billingInterval === 'annually';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center pt-10 pb-6 px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Faça upgrade para mais uso</h2>

                    {/* Toggle */}
                    <div className="inline-flex items-center p-1 bg-gray-800 rounded-lg border border-gray-700">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                !isAnnual ? "bg-gray-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Mensalmente
                        </button>
                        <button
                            onClick={() => setBillingInterval('annually')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                                isAnnual ? "bg-gray-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Anualmente <span className="text-xs text-green-400 font-semibold hidden sm:inline">· Economize 17%</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Standard Plan */}
                        <div className="p-6 rounded-xl border border-gray-700 bg-[#1A1A1A] flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-3xl font-bold text-white">$17 <span className="text-sm font-normal text-gray-400">/ mês, faturado {isAnnual ? 'anualmente' : 'mensalmente'}</span></h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Uso mensal padrão</p>

                            <button
                                onClick={() => onSelectPlan('standard')}
                                className="w-full py-2.5 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors mb-6"
                            >
                                Atualizar
                            </button>

                            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 300 créditos de atualização diários</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 4,000 créditos por mês</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Pesquisa detalhada para tarefas cotidianas</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Sites profissionais para produção padrão</li>
                            </ul>
                        </div>

                        {/* Pro Plan (Highlighted) */}
                        <div className="p-6 rounded-xl border-2 border-blue-500 bg-[#1A1A1A] flex flex-col relative transform md:-translate-y-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <div className="mb-4">
                                <h3 className="text-3xl font-bold text-white">7 dias grátis</h3>
                                <p className="text-sm text-gray-400">$34 / mês, faturado {isAnnual ? 'anualmente' : 'mensalmente'}</p>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Uso mensal personalizável</p>

                            <button
                                onClick={() => onSelectPlan('pro_trial')}
                                className="w-full py-2.5 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors mb-6"
                            >
                                Comece gratuitamente
                            </button>

                            <div className="w-full py-2 px-3 bg-gray-800 rounded-lg mb-6 flex justify-between items-center text-sm text-white">
                                <span>8,000 créditos / mês</span>
                                <span className="text-blue-400 font-medium">Teste gratuito</span>
                            </div>

                            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 300 créditos de atualização diários</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> 8,000 créditos por mês</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Pesquisa detalhada com uso personalizado</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Sites profissionais para necessidades em evolução</li>
                            </ul>
                        </div>

                        {/* Extended Plan */}
                        <div className="p-6 rounded-xl border border-gray-700 bg-[#1A1A1A] flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-3xl font-bold text-white">$167 <span className="text-sm font-normal text-gray-400">/ mês, faturado {isAnnual ? 'anualmente' : 'mensalmente'}</span></h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Uso estendido para produtividade</p>

                            <button
                                onClick={() => onSelectPlan('extended')}
                                className="w-full py-2.5 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors mb-6"
                            >
                                Atualizar
                            </button>

                            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 300 créditos de atualização diários</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 40,000 créditos por mês</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Pesquisa detalhada para tarefas em larga escala</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
