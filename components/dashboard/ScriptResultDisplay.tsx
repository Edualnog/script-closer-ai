'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, Send, Plus, Zap, Clock, ArrowDown, Loader2 } from 'lucide-react'
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
    const [currentStep, setCurrentStep] = useState(0); // 0 = abertura, 1+ = follow conversation
    const [leadResponse, setLeadResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);

    if (!result) return null;

    // Parse roteiro steps
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

    // Get current message to show
    const getCurrentMessage = () => {
        if (currentStep === 0) {
            return result.mensagem_abertura;
        }
        if (currentStep <= roteiroSteps.length) {
            return roteiroSteps[currentStep - 1]?.content || '';
        }
        return null;
    };

    // Handle when lead responds
    const handleLeadResponded = async () => {
        if (!leadResponse.trim() || !handleRefine) return;

        setIsGenerating(true);

        // Add lead's message to conversation
        const newConvo = [...conversation, {
            type: 'lead' as const,
            content: leadResponse,
            timestamp: new Date()
        }];
        setConversation(newConvo);

        // Generate AI response based on lead's message
        const instruction = `O lead respondeu: "${leadResponse}". 
Contexto do produto: ${result.nome_projeto || 'Script de vendas'}
Mensagem anterior: ${getCurrentMessage()}

Gere UMA resposta curta e persuasiva para continuar a conversa e aproximar o lead da venda. Seja natural e direto.`;

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

    // Handle when lead doesn't respond
    const handleNoResponse = () => {
        setShowFollowUp(true);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {result.nome_projeto || 'Seu Script de Vendas'}
                </h2>
                <p className="text-gray-500 mt-2">Siga o fluxo da conversa com seu lead</p>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4">

                {/* Opening Message */}
                <MessageBubble
                    type="you"
                    step={1}
                    label="Mensagem de Abertura"
                    content={result.mensagem_abertura}
                    isActive={currentStep === 0}
                />

                {/* Previous conversation */}
                {conversation.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        type={msg.type}
                        content={msg.content}
                        step={Math.floor(i / 2) + 2}
                    />
                ))}

                {/* Current AI Response (if beyond first step) */}
                {currentStep > 0 && roteiroSteps[currentStep - 1] && !isGenerating && (
                    <MessageBubble
                        type="you"
                        step={currentStep + 1}
                        label={`Passo ${currentStep + 1}`}
                        content={roteiroSteps[currentStep - 1].content}
                        isActive={true}
                    />
                )}

                {/* Loading state */}
                {isGenerating && (
                    <div className="flex justify-end">
                        <div className="bg-indigo-100 rounded-2xl rounded-br-md px-4 py-3 flex items-center gap-2 text-indigo-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Gerando resposta...</span>
                        </div>
                    </div>
                )}

                {/* Decision Point */}
                {!isGenerating && !showFollowUp && (
                    <div className="py-6">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
                            <div className="text-center mb-4">
                                <span className="text-xl">🤔</span>
                                <h3 className="font-bold text-gray-800 mt-1">O lead respondeu?</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* YES - Show input */}
                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>SIM - Cole a resposta:</span>
                                    </div>
                                    <textarea
                                        value={leadResponse}
                                        onChange={(e) => setLeadResponse(e.target.value)}
                                        placeholder="Cole aqui o que o lead respondeu..."
                                        className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleLeadResponded}
                                        disabled={!leadResponse.trim() || isGenerating}
                                        className="w-full mt-3 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Gerar Resposta
                                    </button>
                                </div>

                                {/* NO - Show follow-up option */}
                                <div className="bg-white rounded-xl p-4 border border-red-200">
                                    <div className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                                        <XCircle className="w-5 h-5" />
                                        <span>NÃO respondeu</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Sem resposta? Use um follow-up para reativar o lead.
                                    </p>
                                    <button
                                        onClick={handleNoResponse}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
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
                    <div className="py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-red-500" />
                                <h3 className="font-bold text-red-800">Follow-ups</h3>
                                <span className="text-xs text-red-500">• Envie se o lead não responder</span>
                            </div>

                            <div className="space-y-3">
                                {followUps.length > 0 ? followUps.map((msg: string, i: number) => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-red-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-red-600">
                                                Follow-up {i + 1} • Após {(i + 1) * 24}h
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <WhatsAppButton text={msg} small />
                                                <CopyButton text={msg} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg" />
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm">{msg}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-sm italic">Nenhum follow-up gerado</p>
                                )}
                            </div>

                            <button
                                onClick={() => setShowFollowUp(false)}
                                className="w-full mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                ← Voltar ao fluxo
                            </button>
                        </div>
                    </div>
                )}

                {/* Objections - Quick Access */}
                {result.respostas_objecoes && Object.keys(result.respostas_objecoes).length > 0 && (
                    <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🛡️</span>
                            <h3 className="font-bold text-orange-800">Respostas para Objeções</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(result.respostas_objecoes).slice(0, userPlan === 'free' ? 3 : undefined).map(([key, value], i) => (
                                <div key={key} className="bg-white rounded-lg p-3 border border-orange-100 group">
                                    <h4 className="text-xs font-bold text-orange-700 uppercase mb-1">"{key.replace(/_/g, ' ')}"</h4>
                                    <p className="text-sm text-gray-700">{value as string}</p>
                                    <CopyButton text={value as string} className="mt-2 opacity-0 group-hover:opacity-100 bg-orange-50 hover:bg-orange-100 text-orange-600 p-1 rounded text-xs transition-opacity" />
                                </div>
                            ))}
                            {userPlan === 'free' && Object.keys(result.respostas_objecoes).length > 3 && (
                                <div
                                    onClick={() => router.push('/dashboard/billing')}
                                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-orange-200 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="text-center">
                                        <Zap className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                                        <span className="text-sm font-medium text-orange-700">+{Object.keys(result.respostas_objecoes).length - 3} objeções</span>
                                        <p className="text-xs text-orange-500">Upgrade Pro</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* New Script Button */}
            {onReset && (
                <div className="flex justify-center pt-10 pb-4">
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

// ========== MESSAGE BUBBLE ==========
interface MessageBubbleProps {
    type: 'you' | 'lead' | 'system';
    content: string;
    step?: number;
    label?: string;
    isActive?: boolean;
}

function MessageBubble({ type, content, step, label, isActive }: MessageBubbleProps) {
    const isYou = type === 'you';

    return (
        <div className={`flex ${isYou ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
            <div className={`max-w-[85%] ${isYou ? 'order-2' : 'order-1'}`}>
                {label && (
                    <div className={`text-xs font-semibold mb-1 ${isYou ? 'text-right text-indigo-600' : 'text-left text-gray-500'}`}>
                        {step && <span className="bg-indigo-500 text-white w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px] mr-1">{step}</span>}
                        {label}
                    </div>
                )}
                <div className={`
                    rounded-2xl px-4 py-3 shadow-sm
                    ${isYou
                        ? `bg-indigo-500 text-white rounded-br-md ${isActive ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }
                `}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
                <div className={`flex items-center gap-2 mt-1 ${isYou ? 'justify-end' : 'justify-start'}`}>
                    {isYou && (
                        <>
                            <WhatsAppButton text={content} small />
                            <CopyButton text={content} className={`p-1 rounded ${isYou ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ========== WHATSAPP BUTTON ==========
function WhatsAppButton({ text, small }: { text: string; small?: boolean }) {
    return (
        <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')}
            className={`flex items-center gap-1 ${small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors`}
        >
            <MessageSquare className={small ? 'w-3 h-3' : 'w-4 h-4'} />
            <span>WhatsApp</span>
        </button>
    );
}
