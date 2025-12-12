'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, Send, Plus, Zap, Clock, Loader2, Copy, Check, ArrowRight, ArrowLeft, ArrowDown } from 'lucide-react'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { CopyButton } from '@/components/ui/CopyButton'
import { useRouter } from 'next/navigation'

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

export function ScriptResultDisplay({ result, userPlan, handleRefine, onReset }: ScriptResultDisplayProps) {
    const router = useRouter();
    const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
    const [leadResponse, setLeadResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [pendingResponse, setPendingResponse] = useState<string | null>(null);

    if (!result) return null;

    const parseRoteiro = (text: string) => {
        const rawText = String(text || '');
        const stepPattern = /(?:Passo\s*\d+[:\.]?\s*|^\d+[:\.\)]\s*)/gi;
        const parts = rawText.split(stepPattern).filter(part => part.trim().length > 0);
        if (parts.length > 1) return parts.map(part => part.trim());
        return rawText.split('\n').filter(line => line.trim().length > 3).map(line =>
            line.replace(/^(\d+[\.\):]?\s*|Passo\s*\d+[:\.]?\s*)/i, '').trim()
        );
    };

    const roteiroSteps = parseRoteiro(result.roteiro_conversa);
    const followUps = Array.isArray(result.follow_up) ? result.follow_up : [];

    // Build all items to display
    const allItems: { type: 'you' | 'lead' | 'loading'; content: string; position: 'left' | 'right' }[] = [];

    // First: Opening message (SIM box)
    allItems.push({ type: 'you', content: result.mensagem_abertura, position: 'left' });

    // Then: alternate between lead responses and your responses from history
    conversationHistory.forEach((item, i) => {
        allItems.push({
            type: item.type,
            content: item.content,
            position: item.type === 'lead' ? 'right' : 'left'
        });
    });

    // Add loading state if generating
    if (isGenerating) {
        allItems.push({ type: 'loading', content: '', position: 'left' });
    }

    const handleLeadResponded = async () => {
        if (!leadResponse.trim() || !handleRefine) return;

        // Add lead's response to history
        const newHistory = [...conversationHistory, { type: 'lead' as const, content: leadResponse }];
        setConversationHistory(newHistory);
        setIsGenerating(true);

        const instruction = `O lead respondeu: "${leadResponse}". 
Contexto: ${result.nome_projeto || 'Script de vendas'}
Gere UMA resposta curta e persuasiva para continuar a conversa.`;

        try {
            await handleRefine(instruction);
            // After refine, the next step from roteiro will be used or a new response generated
            const stepIndex = Math.floor(newHistory.length / 2);
            if (roteiroSteps[stepIndex]) {
                setConversationHistory([...newHistory, { type: 'you', content: roteiroSteps[stepIndex] }]);
            }
        } catch (e) {
            console.error(e);
        }

        setLeadResponse('');
        setIsGenerating(false);
        setShowFollowUp(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto font-sans">

            {/* Header */}
            <div className="mb-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {result.nome_projeto || 'Script de Vendas'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Fluxo da conversa</p>
            </div>

            {/* Zigzag Flowchart */}
            <div className="relative">
                {allItems.map((item, index) => (
                    <div key={index} className="relative">
                        {/* Connector Arrow */}
                        {index > 0 && (
                            <div className={`flex items-center justify-center py-3 ${item.position === 'left' ? 'pr-[50%]' : 'pl-[50%]'}`}>
                                <div className="flex items-center gap-1 text-gray-300">
                                    {item.position === 'left' ? (
                                        <>
                                            <ArrowDown className="w-4 h-4" />
                                            <div className="w-16 h-0.5 bg-gray-200" />
                                            <ArrowLeft className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="w-4 h-4" />
                                            <div className="w-16 h-0.5 bg-gray-200" />
                                            <ArrowDown className="w-4 h-4" />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Message Box */}
                        <div className={`flex ${item.position === 'left' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`w-[48%] ${item.type === 'loading' ? '' : ''}`}>
                                {item.type === 'loading' ? (
                                    // Loading Box
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">Gerando resposta...</p>
                                    </div>
                                ) : item.type === 'you' ? (
                                    // Your message (SIM style)
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        {index === 0 && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-gray-900 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">SIM</span>
                                                <span className="text-xs text-gray-400">Abertura</span>
                                            </div>
                                        )}
                                        <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                            <CopyBtn text={item.content} />
                                            <WhatsAppBtn text={item.content} />
                                        </div>
                                    </div>
                                ) : (
                                    // Lead's response
                                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                                        <span className="text-xs text-gray-500 mb-2 block">Lead respondeu:</span>
                                        <p className="text-gray-700 text-sm leading-relaxed italic">"{item.content}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Next Step: Decision or Input */}
                {!isGenerating && !showFollowUp && (
                    <div className="mt-8 pt-4">
                        {/* Connector */}
                        <div className="flex justify-center py-3">
                            <ArrowDown className="w-5 h-5 text-gray-300" />
                        </div>

                        {/* Decision Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <p className="text-center text-gray-600 font-medium text-sm mb-5">O lead respondeu?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* YES */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                                        <CheckCircle className="w-4 h-4 text-gray-600" />
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
                                        Gerar
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
                                        onClick={() => setShowFollowUp(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Ver Follow-ups
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Follow-ups */}
                {showFollowUp && (
                    <div className="mt-6 animate-in fade-in duration-300">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-gray-700 text-sm">Follow-ups</span>
                                <button onClick={() => setShowFollowUp(false)} className="text-xs text-gray-500 hover:text-gray-700">← Voltar</button>
                            </div>
                            <div className="space-y-3">
                                {followUps.map((msg: string, i: number) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs text-gray-500">Após {(i + 1) * 24}h</span>
                                            <p className="text-gray-700 text-sm mt-1">{msg}</p>
                                        </div>
                                        <CopyBtn text={msg} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Objections */}
            {result.respostas_objecoes && Object.keys(result.respostas_objecoes).length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="font-medium text-gray-700 text-sm mb-4">Objeções</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(result.respostas_objecoes).slice(0, userPlan === 'free' ? 3 : undefined).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 border border-gray-100 rounded-lg p-4 group hover:border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase">"{key.replace(/_/g, ' ')}"</span>
                                <p className="text-sm text-gray-700 mt-1">{value as string}</p>
                                <CopyBtn text={value as string} className="mt-2 opacity-0 group-hover:opacity-100" />
                            </div>
                        ))}
                        {userPlan === 'free' && Object.keys(result.respostas_objecoes).length > 3 && (
                            <div onClick={() => router.push('/dashboard/billing')} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                <div className="text-center">
                                    <Zap className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <span className="text-sm text-gray-500">+{Object.keys(result.respostas_objecoes).length - 3}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

// Compact Copy Button
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

// Compact WhatsApp Button
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
