'use client'

import { MessageSquare, CheckCircle2, Zap, Plus, Phone, Video, MoreVertical, ArrowLeft, User } from 'lucide-react'
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

    if (!result) return null;

    const parseRoteiro = (text: string) => {
        const rawText = String(text || '');

        // Try to split by "Passo X:" pattern (handles cases like "Passo 1: ... Passo 2: ...")
        const stepPattern = /(?:Passo\s*\d+[:\.]?\s*|^\d+[:\.\)]\s*)/gi;
        const parts = rawText.split(stepPattern).filter(part => part.trim().length > 0);

        // If we got multiple parts, use them as separate steps
        if (parts.length > 1) {
            return parts.map((part, index) => ({
                stepNumber: index + 1,
                content: part.trim()
            }));
        }

        // Fallback: split by newlines
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

    return (
        <div className="space-y-8 w-full max-w-4xl mx-auto">

            {/* Abertura Card */}
            <div className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        👋 Mensagem de Abertura
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">Use para iniciar a conversa</p>
                </div>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                            <RichTextRenderer content={result.mensagem_abertura} />
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                            <WhatsAppButton text={result.mensagem_abertura || ''} />
                            <CopyButton
                                text={result.mensagem_abertura || ''}
                                className="bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 p-2.5 rounded-xl transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Chat Preview */}
            <div className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
                {/* WhatsApp Header */}
                <div className="whatsapp-header px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArrowLeft className="w-5 h-5 text-white/80" />
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Lead</p>
                            <p className="text-white/70 text-xs">online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/80">
                        <Video className="w-5 h-5" />
                        <Phone className="w-5 h-5" />
                        <MoreVertical className="w-5 h-5" />
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="whatsapp-bg p-4 md:p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                    <div className="space-y-3 max-w-lg ml-auto">
                        {roteiroSteps.map((step, i) => (
                            <div key={i} className="flex justify-end animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 150}ms` }}>
                                <div className="whatsapp-bubble-sent px-4 py-2 shadow-sm max-w-[90%] mr-2">
                                    {step.stepNumber && (
                                        <span className="block text-[10px] font-bold text-green-700 uppercase mb-1 tracking-wide">
                                            Passo {step.stepNumber}
                                        </span>
                                    )}
                                    <p className="text-[15px] text-gray-800 leading-relaxed">
                                        {step.content}
                                    </p>
                                    <div className="flex justify-end items-center gap-1 mt-1">
                                        <span className="text-[11px] text-gray-500">
                                            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Roteiro de Conversa</span>
                    <div className="flex items-center gap-2">
                        <WhatsAppButton text={result.roteiro_conversa || ''} />
                        <CopyButton
                            text={result.roteiro_conversa || ''}
                            className="bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 p-2 rounded-lg transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Objeções Grid */}
            <div className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        🛡️ Quebra de Objeções
                    </h3>
                    <p className="text-orange-100 text-sm mt-1">Respostas prontas para cada objeção</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.respostas_objecoes && Object.entries(result.respostas_objecoes).map(([key, value], index) => {
                            const content = value as string
                            const isLocked = userPlan === 'free' && index >= 3;

                            const iconMap: Record<string, string> = {
                                'esta_caro': '💰',
                                'ta_caro': '💰',
                                'preco_alto': '💰',
                                'nao_tenho_dinheiro': '💸',
                                'vou_pensar': '🤔',
                                'vou_pensar_sobre': '🤔',
                                'preciso_falar': '👥',
                                'falar_com_socio': '👥',
                                'concorrente': '🏢',
                                'ja_uso_concorrente': '🏢',
                                'email': '📧',
                                'me_manda_por_email': '📧',
                                'tempo': '⏰',
                                'nao_tenho_tempo': '⏰',
                                'momento': '📅',
                                'nao_e_o_momento': '📅',
                                'ja_tentei': '❌',
                                'golpe': '🛡️',
                                'confianca': '🤝',
                                'decisor': '👔',
                                'agora_nao': '⏳',
                            };

                            const getIcon = (k: string) => {
                                for (const [pattern, icon] of Object.entries(iconMap)) {
                                    if (k.toLowerCase().includes(pattern)) return icon;
                                }
                                return '💬';
                            };

                            return (
                                <div key={key} className={`bg-gray-50 rounded-xl p-4 relative group border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all ${isLocked ? 'overflow-hidden' : ''}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getIcon(key)}</span>
                                            <h4 className="text-sm font-bold text-gray-800 capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </h4>
                                        </div>
                                        {!isLocked && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CopyButton
                                                    text={content}
                                                    className="text-gray-400 hover:text-orange-600 p-1"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`text-sm text-gray-700 leading-relaxed ${isLocked ? 'filter blur-[6px] select-none opacity-50' : ''}`}>
                                        <RichTextRenderer content={isLocked ? "Conteúdo exclusivo para assinantes Pro." : content} />
                                    </div>

                                    {isLocked && (
                                        <div
                                            onClick={() => router.push('/dashboard/billing')}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 cursor-pointer hover:bg-white/70 transition-colors rounded-xl"
                                        >
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2.5 rounded-full shadow-lg mb-2">
                                                <Zap className="w-5 h-5 text-white fill-current" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                Exclusivo Pro
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Follow Up */}
            {result.follow_up && Array.isArray(result.follow_up) && result.follow_up.length > 0 && (
                <div className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            🔄 Sugestões de Follow-up
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">Se o lead não responder</p>
                    </div>
                    <div className="p-6 space-y-3">
                        {(result.follow_up as string[]).map((msg, i) => (
                            <div key={i} className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <span className="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                                            Opção {i + 1}
                                        </span>
                                        <p className="text-gray-800 text-sm leading-relaxed">{msg}</p>
                                    </div>
                                    <CopyButton
                                        text={msg}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-600 p-1"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Script Button */}
            {onReset && (
                <div className="flex justify-center pt-6 pb-12">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Novo Script
                    </button>
                </div>
            )}

        </div>
    )
}

function WhatsAppButton({ text }: { text: string }) {
    const handleShare = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(String(text || ''))}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors shadow-sm"
            title="Enviar para WhatsApp"
        >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
        </button>
    )
}
