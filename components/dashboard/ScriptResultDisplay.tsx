'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, ChevronDown, ChevronRight, Copy, Check, Zap, Plus, ArrowDown, CornerDownRight } from 'lucide-react'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { CopyButton } from '@/components/ui/CopyButton'
import { useRouter } from 'next/navigation'

interface ScriptResultDisplayProps {
    result: any;
    userPlan: string;
    handleRefine?: (instruction: string) => void;
    onReset?: () => void;
}

export function ScriptResultDisplay({ result, userPlan, handleRefine, onReset }: ScriptResultDisplayProps) {
    const router = useRouter();
    const [activePath, setActivePath] = useState<'yes' | 'no' | null>('yes');
    const [activeStep, setActiveStep] = useState(0);

    if (!result) return null;

    const parseRoteiro = (text: string) => {
        const rawText = String(text || '');
        const stepPattern = /(?:Passo\s*\d+[:\.]?\s*|^\d+[:\.\)]\s*)/gi;
        const parts = rawText.split(stepPattern).filter(part => part.trim().length > 0);

        if (parts.length > 1) {
            return parts.map((part, index) => ({
                stepNumber: index + 1,
                content: part.trim()
            }));
        }

        const lines = rawText.split('\n').filter(line => line.trim().length > 0);
        return lines.map((line, index) => {
            const isStep = /^(\d+[\.\):]?\s*|Passo\s*\d+)/i.test(line);
            const cleanText = line.replace(/^(\d+[\.\):]?\s*|Passo\s*\d+[:\.]?\s*)/i, '').trim();
            return {
                stepNumber: isStep ? (line.match(/\d+/)?.[0] || String(index + 1)) : null,
                content: cleanText || line
            };
        }).filter(item => item.content.length > 3);
    };

    const roteiroSteps = parseRoteiro(result.roteiro_conversa);
    const followUps = Array.isArray(result.follow_up) ? result.follow_up : [];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {result.nome_projeto || 'Seu Script de Vendas'}
                </h2>
                <p className="text-gray-500 mt-2">Siga o fluxo abaixo para converter seu lead</p>
            </div>

            {/* ========== FLOWCHART ========== */}
            <div className="relative">

                {/* STEP 1: Mensagem de Abertura */}
                <FlowNode
                    number={1}
                    title="Mensagem de Abertura"
                    description="Envie para o lead"
                    color="indigo"
                    isActive={activeStep === 0}
                    onClick={() => setActiveStep(0)}
                >
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        <RichTextRenderer content={result.mensagem_abertura} />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <WhatsAppButton text={result.mensagem_abertura || ''} />
                        <CopyButton text={result.mensagem_abertura || ''} className="bg-gray-100 hover:bg-indigo-50 text-gray-600 p-2 rounded-lg" />
                    </div>
                </FlowNode>

                {/* Connector Line */}
                <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>

                {/* DECISION NODE: Lead respondeu? */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl">🤔</span>
                        <h3 className="text-lg font-bold text-gray-800">O lead respondeu?</h3>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => { setActivePath('yes'); setActiveStep(1); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activePath === 'yes'
                                    ? 'bg-green-500 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'
                                }`}
                        >
                            <CheckCircle className="w-5 h-5" />
                            SIM
                        </button>
                        <button
                            onClick={() => { setActivePath('no'); setActiveStep(1); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activePath === 'no'
                                    ? 'bg-red-500 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
                                }`}
                        >
                            <XCircle className="w-5 h-5" />
                            NÃO
                        </button>
                    </div>
                </div>

                {/* Connector Lines - Branching */}
                <div className="flex justify-center py-2">
                    <div className={`w-0.5 h-8 transition-colors ${activePath === 'yes' ? 'bg-green-400' : activePath === 'no' ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                </div>

                {/* ========== YES PATH: Roteiro ========== */}
                {activePath === 'yes' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-4 pl-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">Lead respondeu → Siga o roteiro</span>
                        </div>

                        <div className="space-y-3 border-l-4 border-green-200 pl-6 ml-4">
                            {roteiroSteps.map((step, i) => (
                                <FlowNode
                                    key={i}
                                    number={i + 2}
                                    title={`Passo ${step.stepNumber || i + 1}`}
                                    color="green"
                                    compact
                                    isActive={activeStep === i + 1}
                                    onClick={() => setActiveStep(i + 1)}
                                >
                                    <p className="text-gray-700">{step.content}</p>
                                    <CopyButton text={step.content} className="mt-2 bg-green-50 hover:bg-green-100 text-green-600 p-1.5 rounded-lg text-xs" />
                                </FlowNode>
                            ))}
                        </div>

                        {/* Objeções Section */}
                        {result.respostas_objecoes && Object.keys(result.respostas_objecoes).length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center gap-2 mb-4 pl-4">
                                    <span className="text-xl">🛡️</span>
                                    <span className="font-semibold text-gray-800">Se o lead tiver objeções:</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                                    {Object.entries(result.respostas_objecoes).map(([key, value], index) => {
                                        const content = value as string;
                                        const isLocked = userPlan === 'free' && index >= 3;

                                        return (
                                            <div key={key} className={`bg-orange-50 border border-orange-100 rounded-xl p-4 relative group ${isLocked ? 'overflow-hidden' : ''}`}>
                                                <h4 className="text-sm font-bold text-orange-800 capitalize mb-2">
                                                    "{key.replace(/_/g, ' ')}"
                                                </h4>
                                                <p className={`text-sm text-gray-700 ${isLocked ? 'blur-[4px]' : ''}`}>
                                                    {content}
                                                </p>
                                                {!isLocked && (
                                                    <CopyButton text={content} className="mt-2 opacity-0 group-hover:opacity-100 bg-orange-100 hover:bg-orange-200 text-orange-600 p-1.5 rounded-lg text-xs transition-opacity" />
                                                )}
                                                {isLocked && (
                                                    <div onClick={() => router.push('/dashboard/billing')} className="absolute inset-0 flex items-center justify-center bg-white/70 cursor-pointer rounded-xl">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                                                            <Zap className="w-4 h-4" />
                                                            <span>Pro</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== NO PATH: Follow-ups ========== */}
                {activePath === 'no' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-4 pl-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-700">Lead não respondeu → Envie follow-up</span>
                        </div>

                        <div className="space-y-3 border-l-4 border-red-200 pl-6 ml-4">
                            {followUps.length > 0 ? (
                                followUps.map((msg: string, i: number) => (
                                    <FlowNode
                                        key={i}
                                        number={i + 2}
                                        title={`Follow-up ${i + 1}`}
                                        description={i === 0 ? "Após 24h" : i === 1 ? "Após 48h" : "Após 72h"}
                                        color="red"
                                        compact
                                        isActive={activeStep === i + 1}
                                        onClick={() => setActiveStep(i + 1)}
                                    >
                                        <p className="text-gray-700">{msg}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <WhatsAppButton text={msg} small />
                                            <CopyButton text={msg} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs" />
                                        </div>
                                    </FlowNode>
                                ))
                            ) : (
                                <div className="text-gray-500 italic text-sm p-4">Nenhum follow-up gerado</div>
                            )}
                        </div>

                        {/* Loop back */}
                        <div className="mt-6 flex items-center gap-2 pl-4 text-gray-500">
                            <CornerDownRight className="w-4 h-4" />
                            <span className="text-sm">Se responder → volte para o roteiro (SIM)</span>
                        </div>
                    </div>
                )}

            </div>

            {/* New Script Button */}
            {onReset && (
                <div className="flex justify-center pt-8 pb-4">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Novo Script
                    </button>
                </div>
            )}

        </div>
    );
}

// ========== FLOW NODE COMPONENT ==========
interface FlowNodeProps {
    number: number;
    title: string;
    description?: string;
    color: 'indigo' | 'green' | 'red' | 'orange';
    compact?: boolean;
    isActive?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

function FlowNode({ number, title, description, color, compact, isActive, onClick, children }: FlowNodeProps) {
    const colorClasses = {
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            activeBorder: 'border-indigo-500',
            badge: 'bg-indigo-500',
            text: 'text-indigo-800'
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            activeBorder: 'border-green-500',
            badge: 'bg-green-500',
            text: 'text-green-800'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            activeBorder: 'border-red-500',
            badge: 'bg-red-500',
            text: 'text-red-800'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            activeBorder: 'border-orange-500',
            badge: 'bg-orange-500',
            text: 'text-orange-800'
        }
    };

    const c = colorClasses[color];

    return (
        <div
            onClick={onClick}
            className={`
                ${c.bg} border-2 ${isActive ? c.activeBorder : c.border} 
                ${compact ? 'rounded-xl p-4' : 'rounded-2xl p-6'} 
                shadow-sm transition-all cursor-pointer hover:shadow-md
            `}
        >
            <div className="flex items-start gap-3">
                <div className={`${c.badge} text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0`}>
                    {number}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${c.text} ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
                        {description && (
                            <span className="text-xs text-gray-400">{description}</span>
                        )}
                    </div>
                    <div className={`mt-2 ${compact ? 'text-sm' : 'text-base'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========== WHATSAPP BUTTON ==========
function WhatsAppButton({ text, small }: { text: string; small?: boolean }) {
    const handleShare = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(String(text || ''))}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 ${small ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors`}
            title="Enviar para WhatsApp"
        >
            <MessageSquare className={small ? 'w-3 h-3' : 'w-4 h-4'} />
            <span>WhatsApp</span>
        </button>
    );
}
