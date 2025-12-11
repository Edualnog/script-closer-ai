"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, MessageCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingWizard() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Check local storage for onboarding completion
        const hasCompletedOnboarding = localStorage.getItem("script_closer_onboarding_completed");
        if (!hasCompletedOnboarding) {
            // Small delay for entrance animation
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, []);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleComplete = () => {
        localStorage.setItem("script_closer_onboarding_completed", "true");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-100">

                {/* Progress Bar (Minimalist) */}
                <div className="h-0.5 bg-gray-100 w-full flex">
                    <div
                        className="h-full bg-black transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 pt-10">
                    {/* Close Button */}
                    <button
                        onClick={handleComplete}
                        className="absolute top-4 right-4 text-gray-300 hover:text-gray-900 transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-900 mb-2">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Bem-vindo ao ScriptCloser</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Sua arma secreta para fechar mais vendas no WhatsApp e Instagram.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Education */}
                    {step === 2 && (
                        <div className="text-center space-y-6">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-900 mb-2">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Scripts Invisíveis</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Nossa IA cria conversas naturais, eliminando a cara de "vendedor chato".
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Call to Action */}
                    {step === 3 && (
                        <div className="text-center space-y-6">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-900 mb-2">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Vamos começar?</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Lembre-se de selecionar sua <strong>Região</strong> no painel para ativar o sotaque correto.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-4">
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                Continuar
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                Criar Primeiro Script
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
