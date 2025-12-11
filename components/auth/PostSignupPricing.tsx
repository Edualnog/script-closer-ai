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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Pro Plan */}
                        <div className="p-6 rounded-xl border border-gray-700 bg-[#1A1A1A] flex flex-col relative transform transition-all hover:scale-[1.02]">
                            {isAnnual && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    50% OFF
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">R${isAnnual ? '9,90' : '19,90'}</span>
                                    <span className="text-sm font-normal text-gray-400">/ mês</span>
                                </div>
                                {isAnnual && <p className="text-xs text-green-400 mt-1">Faturado R$ 118,80 anualmente</p>}
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Para quem vende todos os dias.</p>

                            <button
                                onClick={() => onSelectPlan('pro')}
                                className="w-full py-2.5 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors mb-6"
                            >
                                Selecionar Pro
                            </button>

                            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 20 scripts / mês</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Objeções desbloqueadas</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Follow-up automático</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Memória de produtos</li>
                            </ul>
                        </div>

                        {/* Pro+ Plan (Highlighted) */}
                        <div className="p-6 rounded-xl border-2 border-blue-500 bg-[#1A1A1A] flex flex-col relative transform md:-translate-y-2 shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:scale-[1.02] transition-all">
                            {isAnnual && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    33% OFF
                                </div>
                            )}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                                MAIS POPULAR
                            </div>

                            <div className="mb-4 mt-2">
                                <h3 className="text-2xl font-bold text-white mb-2">Pro+</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">R${isAnnual ? '39,90' : '59,90'}</span>
                                    <span className="text-sm font-normal text-gray-400">/ mês</span>
                                </div>
                                {isAnnual && <p className="text-xs text-green-400 mt-1">Faturado R$ 478,80 anualmente</p>}
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Poder total sem limites.</p>

                            <button
                                onClick={() => onSelectPlan('pro_plus')}
                                className="w-full py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors mb-6"
                            >
                                7 dias grátis
                            </button>

                            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Tudo do Pro</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Scripts Ilimitados</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Produtos Ilimitados</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Mockups & Vídeos IA</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Suporte Prioritário</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
