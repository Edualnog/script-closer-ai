'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, XCircle, Send, Clock, Loader2, Copy, Check, ArrowDown, Sparkles } from 'lucide-react'
import { CopyButton } from '@/components/ui/CopyButton'
import { useRouter } from 'next/navigation'
import { TextShimmerWave } from '@/components/ui/TextShimmerWave'

interface ScriptFlowViewProps {
    script: {
        id: string;
        mensagem_abertura: string;
        roteiro_conversa: string;
        respostas_objecoes: Record<string, string>;
        follow_up: string[] | null;
        tipo_lead?: string;    // frio, morno, quente
        canal_venda?: string;  // whatsapp, instagram, etc
        regiao?: string;       // Sul, SP, RJ, Nordeste, Neutro
    };
    productName: string;
    productId: string;
}

interface ConversationItem {
    type: 'you' | 'lead';
    content: string;
}

export function ScriptFlowView({ script, productName, productId }: ScriptFlowViewProps) {
    const router = useRouter();
    const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
    const [leadResponse, setLeadResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);

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

    const roteiroSteps = parseRoteiro(script.roteiro_conversa);
    const followUps = Array.isArray(script.follow_up) ? script.follow_up : [];

    // Build flow items
    const buildFlowItems = () => {
        const items: { type: 'you' | 'lead' | 'loading'; content: string; position: 'left' | 'right' }[] = [];

        // Start with opening message
        items.push({ type: 'you', content: script.mensagem_abertura, position: 'left' });

        // Add conversation history
        conversationHistory.forEach(item => {
            items.push({
                type: item.type,
                content: item.content,
                position: item.type === 'lead' ? 'right' : 'left'
            });
        });

        // Add loading if generating
        if (isGenerating) {
            items.push({ type: 'loading', content: '', position: 'left' });
        }

        // Add generated response if any
        if (generatedResponse) {
            items.push({ type: 'you', content: generatedResponse, position: 'left' });
        }

        return items;
    };

    const handleLeadResponded = async () => {
        if (!leadResponse.trim()) return;

        const newHistory = [...conversationHistory, { type: 'lead' as const, content: leadResponse }];
        setConversationHistory(newHistory);
        setLeadResponse('');
        setIsGenerating(true);
        setShowFollowUp(false);

        try {
            // Call AI API for contextual response
            const response = await fetch('/api/generate-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: productName,
                    productDescription: script.mensagem_abertura,
                    leadMessage: leadResponse,
                    conversationHistory: newHistory,
                    leadType: script.tipo_lead || 'morno',
                    region: script.regiao || 'Neutro',
                    salesChannel: script.canal_venda || 'WhatsApp'
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

        setIsGenerating(false);
    };

    const flowItems = buildFlowItems();

    return (
        <div className="w-full font-sans">

            {/* Header */}
            <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Fluxo da conversa</p>
            </div>

            {/* Zigzag Flowchart */}
            <div className="relative">
                {flowItems.map((item, index) => (
                    <div key={index} className="relative mb-4">
                        {/* Connector */}
                        {index > 0 && (
                            <div className={`flex items-center py-2 ${item.position === 'left' ? 'justify-start pl-4' : 'justify-end pr-4'}`}>
                                <div className="flex items-center text-gray-300">
                                    <ArrowDown className="w-4 h-4" />
                                </div>
                            </div>
                        )}

                        {/* Box */}
                        <div className={`flex ${item.position === 'left' ? 'justify-start' : 'justify-end'}`}>
                            <div className="w-[70%] md:w-[55%]">
                                {item.type === 'loading' ? (
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
                                        {index === 0 && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-gray-900 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">Você</span>
                                                <span className="text-xs text-gray-400">Abertura</span>
                                            </div>
                                        )}
                                        {index > 0 && item.type === 'you' && (
                                            <span className="text-xs text-gray-400 mb-2 block">Sua resposta</span>
                                        )}
                                        <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                            <CopyBtn text={item.content} />
                                            <WhatsAppBtn text={item.content} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                                        <span className="text-xs text-gray-500 mb-2 block">Lead disse:</span>
                                        <p className="text-gray-700 text-sm leading-relaxed italic">"{item.content}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Decision Point */}
                {!isGenerating && !showFollowUp && (
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
                                        Próximo passo
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
                                        Follow-ups
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Follow-ups */}
                {showFollowUp && (
                    <div className="mt-6 animate-in fade-in">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-gray-700 text-sm">Follow-ups</span>
                                <button onClick={() => setShowFollowUp(false)} className="text-xs text-gray-500 hover:text-gray-700">← Voltar</button>
                            </div>
                            <div className="space-y-3">
                                {followUps.length > 0 ? followUps.map((msg: string, i: number) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs text-gray-500">Após {(i + 1) * 24}h</span>
                                            <p className="text-gray-700 text-sm mt-1">{msg}</p>
                                        </div>
                                        <CopyBtn text={msg} />
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-sm">Nenhum follow-up</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
