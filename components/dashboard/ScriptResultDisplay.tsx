'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, Send, Plus, Clock, Loader2, Copy, Check, ArrowDown, AlertTriangle, Sparkles } from 'lucide-react'
import { CopyButton } from '@/components/ui/CopyButton'
import { useRouter } from 'next/navigation'
import { TextShimmerWave } from '@/components/ui/TextShimmerWave'

interface ConversationItem {
    type: 'you' | 'lead';
    content: string;
}

interface ScriptResultDisplayProps {
    result: any;
    userPlan: string;
    handleRefine?: (instruction: string) => void;
    onReset?: () => void;
}

export function ScriptResultDisplay({ result, userPlan, onReset }: ScriptResultDisplayProps) {
    const router = useRouter();
    const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
    const [leadResponse, setLeadResponse] = useState('');
    const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [dynamicFollowUps, setDynamicFollowUps] = useState<Array<{ timing: string; message: string }> | null>(null);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);

    if (!result) return null;

    const parseRoteiro = (text: string) => {
        const rawText = String(text || '');
        const stepPattern = /(?:Passo\s*\d+[:\.]?\s*|^\d+[:\.\)]\s*)/gi;
        const parts = rawText.split(stepPattern).filter(part => part.trim().length > 0);

        // Clean up function to remove formatting artifacts
        const cleanText = (t: string) => {
            return t
                .trim()
                .replace(/^[:\s"']+/, '')  // Remove leading colons, quotes, spaces
                .replace(/[:\s"',]+$/, '') // Remove trailing colons, quotes, commas
                .replace(/^["']|["']$/g, '') // Remove surrounding quotes
                .trim();
        };

        if (parts.length > 1) return parts.map(cleanText);
        return rawText.split('\n').filter(line => line.trim().length > 3).map(line =>
            cleanText(line.replace(/^(\d+[\.\):]?\s*|Passo\s*\d+[:\.]?\s*)/i, ''))
        );
    };

    const roteiroSteps = parseRoteiro(result.roteiro_conversa);

    // Handler to generate dynamic follow-ups
    const handleShowFollowUps = async () => {
        setShowFollowUp(true);

        // If we already have dynamic follow-ups, don't regenerate
        if (dynamicFollowUps) return;

        setIsLoadingFollowUps(true);
        try {
            const response = await fetch('/api/generate-followups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: result.nome_projeto || 'Produto',
                    productDescription: result.mensagem_abertura,
                    openingMessage: result.mensagem_abertura,
                    conversationHistory
                })
            });

            if (response.ok) {
                const data = await response.json();
                setDynamicFollowUps(data.followups || []);
            }
        } catch (error) {
            console.error('Error generating follow-ups:', error);
        }
        setIsLoadingFollowUps(false);
    };

    // Build all items - keeps existing script and appends conversation
    const buildFlowItems = () => {
        const items: { type: 'you' | 'lead' | 'loading'; content: string; position: 'left' | 'right'; label?: string }[] = [];

        // 1. Opening message (always first)
        items.push({ type: 'you', content: result.mensagem_abertura, position: 'left', label: 'Abertura' });

        // 2. All conversation history (alternating)
        conversationHistory.forEach((item, i) => {
            items.push({
                type: item.type,
                content: item.content,
                position: item.type === 'lead' ? 'right' : 'left',
                label: item.type === 'lead' ? 'Lead' : `Passo ${Math.floor(i / 2) + 2}`
            });
        });

        // 3. Loading box (inline, not full-screen)
        if (isGeneratingLocal) {
            items.push({ type: 'loading', content: '', position: 'left' });
        }

        return items;
    };

    // Detect negative responses (2 or more)
    const negativePatterns = ['não quero', 'nao quero', 'não tenho interesse', 'nao tenho interesse', 'não preciso', 'nao preciso', 'desculpa', 'obrigado mas', 'não obrigado', 'nao obrigado', 'deixa pra lá', 'deixa pra la', 'não é pra mim', 'nao e pra mim', 'não me interessa', 'nao me interessa'];
    const negativeCount = conversationHistory.filter(msg =>
        msg.type === 'lead' && negativePatterns.some(pattern => msg.content.toLowerCase().includes(pattern))
    ).length;
    const showWarning = negativeCount >= 2;

    const handleLeadResponded = async () => {
        if (!leadResponse.trim()) return;

        // 1. Add lead's message
        const newHistory = [...conversationHistory, { type: 'lead' as const, content: leadResponse }];
        setConversationHistory(newHistory);
        const savedLeadMessage = leadResponse;
        setLeadResponse('');
        setIsGeneratingLocal(true);
        setShowFollowUp(false);

        try {
            // 2. Call AI API for contextual response
            const response = await fetch('/api/generate-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: result.nome_projeto || 'Produto',
                    productDescription: result.mensagem_abertura,
                    leadMessage: savedLeadMessage,
                    conversationHistory: newHistory,
                    leadType: result.tipo_lead || result.leadType || 'morno',
                    region: result.regiao || result.region || 'Neutro',
                    salesChannel: result.canal_venda || result.salesChannel || 'WhatsApp'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setConversationHistory([...newHistory, { type: 'you', content: data.response }]);
            } else {
                // Fallback to roteiro step if API fails
                const stepIndex = Math.floor(newHistory.length / 2);
                const fallback = roteiroSteps[stepIndex] || 'Posso te ajudar com mais alguma informação?';
                setConversationHistory([...newHistory, { type: 'you', content: fallback }]);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            const stepIndex = Math.floor(newHistory.length / 2);
            const fallback = roteiroSteps[stepIndex] || 'Posso te ajudar com mais alguma informação?';
            setConversationHistory([...newHistory, { type: 'you', content: fallback }]);
        }

        setIsGeneratingLocal(false);
    };

    const flowItems = buildFlowItems();

    return (
        <div className="w-full max-w-4xl mx-auto font-sans">

            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {result.nome_projeto || 'Script de Vendas'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Fluxo da conversa</p>
            </div>

            {/* Flowchart */}
            <div className="relative">
                {flowItems.map((item, index) => (
                    <div key={index} className="relative mb-4">
                        {/* Arrow connector */}
                        {index > 0 && (
                            <div className="flex justify-center py-2">
                                <ArrowDown className="w-4 h-4 text-gray-300" />
                            </div>
                        )}

                        {/* Box */}
                        <div className={`flex ${item.position === 'left' ? 'justify-start' : 'justify-end'}`}>
                            <div className="w-[75%] md:w-[60%]">
                                {item.type === 'loading' ? (
                                    // INLINE Loading - animated shimmer
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <TextShimmerWave className="text-base font-medium text-gray-700">
                                            Gerando resposta...
                                        </TextShimmerWave>
                                    </div>
                                ) : item.type === 'you' ? (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                        <span className="text-xs text-gray-400 mb-2 block">{item.label}</span>
                                        <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                            <CopyBtn text={item.content} />
                                            <WhatsAppBtn text={item.content} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                                        <span className="text-xs text-gray-500 mb-2 block">{item.label}</span>
                                        <p className="text-gray-700 text-sm leading-relaxed italic">"{item.content}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Decision Point - only show when not loading */}
                {!isGeneratingLocal && !showFollowUp && (
                    <div className="mt-6">
                        <div className="flex justify-center py-2">
                            <ArrowDown className="w-4 h-4 text-gray-300" />
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <p className="text-center text-gray-600 font-medium text-sm mb-5">O lead respondeu?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* YES */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                                        <CheckCircle className="w-4 h-4" />
                                        SIM
                                    </div>
                                    <textarea
                                        value={leadResponse}
                                        onChange={(e) => setLeadResponse(e.target.value)}
                                        placeholder="Cole a resposta do lead..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleLeadResponded}
                                        disabled={!leadResponse.trim()}
                                        className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Próximo
                                    </button>
                                </div>

                                {/* NO */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                                        <XCircle className="w-4 h-4 text-gray-400" />
                                        NÃO
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">Use um follow-up</p>
                                    <button
                                        onClick={handleShowFollowUps}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Gerar Follow-ups
                                    </button>
                                </div>
                            </div>

                            {/* Warning after 2 negative responses */}
                            {showWarning && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Aviso</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            O lead demonstrou desinteresse 2 vezes. Considere tentar uma abordagem diferente ou encerrar cordialmente para não forçar demais.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Follow-ups - Dynamic */}
                {showFollowUp && (
                    <div className="mt-6 animate-in fade-in">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-gray-700 text-sm">Follow-ups Personalizados</span>
                                <button onClick={() => setShowFollowUp(false)} className="text-xs text-gray-500 hover:text-gray-700">← Voltar</button>
                            </div>

                            {isLoadingFollowUps ? (
                                <div className="text-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Gerando follow-ups personalizados...</p>
                                </div>
                            ) : dynamicFollowUps && dynamicFollowUps.length > 0 ? (
                                <div className="space-y-3">
                                    {dynamicFollowUps.map((fu, i) => (
                                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3">
                                            <div>
                                                <span className="text-xs text-gray-500">Após {fu.timing}</span>
                                                <p className="text-gray-700 text-sm mt-1">{fu.message}</p>
                                            </div>
                                            <CopyBtn text={fu.message} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-4">Clique para gerar follow-ups</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* New Script */}
            {onReset && (
                <div className="flex justify-center pt-12">
                    <button onClick={onReset} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                        <Plus className="w-4 h-4" /> Novo Script
                    </button>
                </div>
            )}
        </div>
    );
}

// Copy Button
function CopyBtn({ text, className = '' }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all ${className}`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    );
}

// WhatsApp Button
function WhatsAppBtn({ text }: { text: string }) {
    return (
        <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
        >
            <MessageSquare className="w-3 h-3" /> WhatsApp
        </button>
    );
}
