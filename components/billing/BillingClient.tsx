"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, Loader2, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingClientProps {
    user: {
        id: string;
        email: string;
        nome: string | null;
        plano_atual: string;
    };
}

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
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            const current = startValue + (value - startValue) * ease
            setDisplayValue(current)

            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }
        window.requestAnimationFrame(step)
    }, [value])

    return <span>{displayValue.toFixed(2).replace('.', ',')}</span>
}

export function BillingClient({ user }: BillingClientProps) {
    const supabase = createClient();
    const router = useRouter();

    // Profile State
    const [name, setName] = useState(user.nome || "");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);

    // Plan State
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly')
    const isAnnual = billingInterval === 'annually'
    const currentPlan = user.plano_atual || 'free';

    // Pricing Logic
    // Pricing Logic
    const priceProMonthly = 19.90
    const priceProPlusMonthly = 59.90
    const priceProAnnual = 9.90
    const priceProPlusAnnual = 39.90

    const discountPro = Math.round(((priceProMonthly - priceProAnnual) / priceProMonthly) * 100)
    const discountProPlus = Math.round(((priceProPlusMonthly - priceProPlusAnnual) / priceProPlusMonthly) * 100)

    const currentProPrice = isAnnual ? priceProAnnual : priceProMonthly
    const currentProPlusPrice = isAnnual ? priceProPlusAnnual : priceProPlusMonthly

    const handleUpdateProfile = async () => {
        if (!name.trim()) return;
        setProfileSaving(true);
        try {
            const { error } = await supabase.from('users').update({ nome: name }).eq('id', user.id);
            if (error) throw error;
            setIsEditingProfile(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        } finally {
            setProfileSaving(false);
        }
    };

    const handleUpgrade = (plan: string) => alert(`Upgrade para ${plan} (${billingInterval}) em breve!`);

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-8 px-4 space-y-12">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Planos e Conta</h1>
                <p className="text-gray-500 mt-2">Gerencie seu perfil e sua assinatura.</p>
            </div>

            {/* Profile Section */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Seu Perfil</h2>
                        <p className="text-sm text-gray-500">Informações visíveis na sua conta</p>
                    </div>
                </div>

                <div className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={user.email} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditingProfile}
                                className={cn("w-full px-4 py-2 border rounded-lg transition-all", isEditingProfile ? "bg-white border-indigo-500 ring-2 ring-indigo-500/10 focus:outline-none" : "bg-gray-50 border-gray-200 text-gray-700")}
                            />
                            {isEditingProfile ? (
                                <button onClick={handleUpdateProfile} disabled={profileSaving} className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 min-w-[80px] flex items-center justify-center">
                                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                                </button>
                            ) : (
                                <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Editar</button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section>
                {/* Toggle */}
                <div className="flex justify-start items-center gap-4 mb-8">
                    <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-gray-900" : "text-gray-500")}>Mensalmente</span>
                    <button
                        onClick={() => setBillingInterval(isAnnual ? 'monthly' : 'annually')}
                        className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <div className={cn("absolute left-1 top-1 w-6 h-6 bg-black rounded-full shadow-sm transition-transform duration-200 ease-in-out", isAnnual ? "translate-x-6" : "translate-x-0")} />
                    </button>
                    <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-gray-900" : "text-gray-500")}>Anualmente</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* FREE */}
                    <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        <h3 className="font-semibold text-gray-900 text-xl mb-2">Free</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">R$0</span>
                            <span className="text-gray-500"> / mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">Para testar rapidamente e sentir o poder da IA.</p>

                        <button disabled={currentPlan === 'free'} className="block w-full py-2.5 rounded-lg bg-[#171717] text-white text-center font-medium hover:bg-gray-800 transition-colors mb-8 disabled:opacity-50">
                            {currentPlan === 'free' ? "Plano Atual" : "Downgrade"}
                        </button>

                        <ul className="space-y-4 text-sm text-gray-600">
                            {['3 scripts completos por mês', 'Identificação do produto pela IA', 'Mensagem de abertura', 'Roteiro básico'].map((f, i) => (
                                <li key={i} className="flex items-start gap-3"><Check className="h-5 w-5 text-gray-900 shrink-0" /><span>{f}</span></li>
                            ))}
                        </ul>
                    </div>

                    {/* PRO */}
                    <div className="p-8 rounded-2xl border-2 border-[#007AFF] bg-blue-50/30 relative shadow-xl shadow-blue-500/10 transform md:-translate-y-4 z-10 transition-all">
                        {isAnnual && <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">{discountPro}% OFF</div>}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#007AFF] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-30 tracking-wider">RECOMENDADO</div>

                        <h3 className="font-semibold text-gray-900 text-xl mb-2 mt-2">Pro</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">R$<AnimatedPrice value={currentProPrice} /></span>
                            <span className="text-gray-500"> / mês</span>
                            {isAnnual && <p className="text-xs text-green-600 font-medium mt-1">Economize R$ 10,00 por mês</p>}
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">Plano ideal para quem vende todos os dias.</p>

                        <button onClick={() => handleUpgrade('pro')} disabled={currentPlan === 'pro'} className="block w-full py-2.5 rounded-lg bg-[#007AFF] text-white text-center font-medium hover:bg-[#0062cc] transition-colors shadow-lg shadow-blue-500/30 mb-8 disabled:opacity-50">
                            {currentPlan === 'pro' ? "Plano Atual" : "Escolher Pro"}
                        </button>

                        <div className="text-xs font-semibold text-[#007AFF] mb-4 uppercase tracking-wider">Tudo do Free +</div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            {['20 scripts completos por mês', 'Objeções desbloqueadas', 'Follow-up automático da IA', 'Memória dos produtos'].map((f, i) => (
                                <li key={i} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#007AFF] shrink-0" /><span>{f}</span></li>
                            ))}
                        </ul>
                    </div>

                    {/* PRO+ */}
                    <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors relative">
                        {isAnnual && <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">{discountProPlus}% OFF</div>}
                        <h3 className="font-semibold text-gray-900 text-xl mb-2">Pro+</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">R$<AnimatedPrice value={currentProPlusPrice} /></span>
                            <span className="text-gray-500"> / mês</span>
                            {isAnnual && <p className="text-xs text-green-600 font-medium mt-1">Economize R$ 20,00 por mês</p>}
                        </div>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">Experiência premium para alto volume.</p>

                        <button onClick={() => handleUpgrade('pro_plus')} disabled={currentPlan === 'pro_plus'} className="block w-full py-2.5 rounded-lg bg-[#171717] text-white text-center font-medium hover:bg-gray-800 transition-colors mb-8 disabled:opacity-50">
                            {currentPlan === 'pro_plus' ? "Plano Atual" : "Escolher Pro+"}
                        </button>

                        <div className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-wider">Tudo do Pro +</div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            {['Mockups profissionais por IA', '3 vídeos IA de propaganda', 'Scripts ilimitados', 'Produtos ilimitados'].map((f, i) => (
                                <li key={i} className="flex items-start gap-3"><Check className="h-5 w-5 text-gray-900 shrink-0" /><span>{f}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}
