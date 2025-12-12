'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, Send, Plus, Zap, Clock, Loader2, Copy, Check } from 'lucide-react'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { CopyButton } from '@/components/ui/CopyButton'
import { useRouter } from 'next/navigation'

interface Message {
    type: 'you' | 'lead' | 'system';
    content: string;
    timestamp: Date;
}

interface ScriptResultDisplayProps {
    result: any;
    userPlan: string;
    handleRefine?: (instruction: string) => void;
    onReset?: () => void;
}

export function ScriptResultDisplay({ result, userPlan, handleRefine, onReset }: ScriptResultDisplayProps) {
    const router = useRouter();
    const [conversation, setConversation] = useState<Message[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [leadResponse, setLeadResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);

    if (!result) return null;

    const parseRoteiro = (text: string) => {
        const rawText = String(text || '');
        const stepPattern = /(?:Passo\s*\d+[:\.]?\s*|^\d+[:\.\)]\s*)/gi;
        const parts = rawText.split(stepPattern).filter(part => part.trim().length > 0);
        if (parts.length > 1) {
            return parts.map((part, index) => ({ stepNumber: index + 1, content: part.trim() }));
        }
        return rawText.split('\n').filter(line => line.trim().length > 0).map((line, i) => ({
            stepNumber: i + 1,
            content: line.replace(/^(\d+[\.\):]?\s*|Passo\s*\d+[:\.]?\s*)/i, '').trim()
        })).filter(item => item.content.length > 3);
    };

    const roteiroSteps = parseRoteiro(result.roteiro_conversa);
    const followUps = Array.isArray(result.follow_up) ? result.follow_up : [];

    const getCurrentMessage = () => {
        if (currentStep === 0) return result.mensagem_abertura;
        if (currentStep <= roteiroSteps.length) return roteiroSteps[currentStep - 1]?.content || '';
        return null;
    };

    const handleLeadResponded = async () => {
        if (!leadResponse.trim() || !handleRefine) return;
        setIsGenerating(true);

        const newConvo = [...conversation, { type: 'lead' as const, content: leadResponse, timestamp: new Date() }];
        setConversation(newConvo);

        const instruction = `O lead respondeu: "${leadResponse}". 
Contexto: ${result.nome_projeto || 'Script de vendas'}
Mensagem anterior: ${getCurrentMessage()}
Gere UMA resposta curta e persuasiva para continuar a conversa.`;

        try {
            await handleRefine(instruction);
            setCurrentStep(prev => prev + 1);
        } catch (e) {
            console.error(e);
        }

        setLeadResponse('');
        setIsGenerating(false);
        setShowFollowUp(false);
    };

    return (
        <div className="w-full max-w-3xl mx-auto font-sans">

            {/* Header - Clean and minimal */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {result.nome_projeto || 'Script de Vendas'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Siga o fluxo da conversa</p>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-5">

                {/* Opening Message */}
                <MessageCard
                    step={1}
                    label="Abertura"
                    content={result.mensagem_abertura}
                    isActive={currentStep === 0}
                />

                {/* Previous conversation */}
                {conversation.map((msg, i) => (
                    <MessageCard
                        key={i}
                        type={msg.type}
                        content={msg.content}
                    />
                ))}

                {/* Current step from roteiro */}
                {currentStep > 0 && roteiroSteps[currentStep - 1] && !isGenerating && (
                    <MessageCard
                        step={currentStep + 1}
                        label={`Passo ${currentStep + 1}`}
                        content={roteiroSteps[currentStep - 1].content}
                        isActive={true}
                    />
                )}

                {/* Loading */}
                {isGenerating && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando resposta...</span>
                    </div>
                )}

                {/* Decision Point - Neutral styling */}
                {!isGenerating && !showFollowUp && (
                    <div className="py-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <p className="text-center text-gray-600 font-medium mb-5">O lead respondeu?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* YES */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                                        <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                        SIM - Cole a resposta
                                    </div>
                                    <textarea
                                        value={leadResponse}
                                        onChange={(e) => setLeadResponse(e.target.value)}
                                        placeholder="Cole o que o lead respondeu..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleLeadResponded}
                                        disabled={!leadResponse.trim() || isGenerating}
                                        className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Gerar Resposta
                                    </button>
                                </div>

                                {/* NO */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                                        <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                                            <XCircle className="w-3 h-3 text-white" />
                                        </div>
                                        NÃO respondeu
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Use um follow-up para reengajar o lead.
                                    </p>
                                    <button
                                        onClick={() => setShowFollowUp(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Ver Follow-ups
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Follow-up Section */}
                {showFollowUp && (
                    <div className="py-4 animate-in fade-in duration-300">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700 text-sm">Follow-ups</span>
                                </div>
                                <button onClick={() => setShowFollowUp(false)} className="text-xs text-gray-500 hover:text-gray-700">
                                    ← Voltar
                                </button>
                            </div>

                            <div className="space-y-3">
                                {followUps.length > 0 ? followUps.map((msg: string, i: number) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500">
                                                Após {(i + 1) * 24}h
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <CopyButton text={msg} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm">{msg}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-sm">Nenhum follow-up disponível</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Objections - Minimal styling */}
                {result.respostas_objecoes && Object.keys(result.respostas_objecoes).length > 0 && (
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="font-medium text-gray-700 text-sm mb-4">Respostas para Objeções</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(result.respostas_objecoes).slice(0, userPlan === 'free' ? 3 : undefined).map(([key, value], i) => (
                                <div key={key} className="bg-gray-50 border border-gray-100 rounded-lg p-4 group hover:border-gray-200 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">"{key.replace(/_/g, ' ')}"</span>
                                        <CopyButton text={value as string} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-opacity" />
                                    </div>
                                    <p className="text-sm text-gray-700">{value as string}</p>
                                </div>
                            ))}
                            {userPlan === 'free' && Object.keys(result.respostas_objecoes).length > 3 && (
                                <div
                                    onClick={() => router.push('/dashboard/billing')}
                                    className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="text-center">
                                        <Zap className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                        <span className="text-sm text-gray-500">+{Object.keys(result.respostas_objecoes).length - 3} objeções</span>
                                        <p className="text-xs text-gray-400">Upgrade</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* New Script Button */}
            {onReset && (
                <div className="flex justify-center pt-12">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Script
                    </button>
                </div>
            )}

        </div>
    );
}

// ========== MESSAGE CARD - Clean & Minimal ==========
interface MessageCardProps {
    type?: 'you' | 'lead';
    content: string;
    step?: number;
    label?: string;
    isActive?: boolean;
}

function MessageCard({ type = 'you', content, step, label, isActive }: MessageCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isLead = type === 'lead';

    return (
        <div className={`${isLead ? 'pl-8' : ''}`}>
            {label && (
                <div className="flex items-center gap-2 mb-2">
                    {step && (
                        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">
                            {step}
                        </span>
                    )}
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                </div>
            )}
            <div className={`
                rounded-xl p-4 border
                ${isLead
                    ? 'bg-gray-100 border-gray-200 text-gray-600'
                    : `bg-white border-gray-200 ${isActive ? 'ring-1 ring-gray-900 ring-offset-1' : ''}`
                }
            `}>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

                {!isLead && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
