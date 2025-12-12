'use client'

import { MessageSquare, CheckCircle2, Copy, Zap, ChevronDown, Flag, Plus } from 'lucide-react'
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">

            {/* Abertura */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        👋 Mensagem de Abertura
                    </h3>
                    <div className="flex items-center gap-2">
                        <WhatsAppButton text={result.mensagem_abertura || ''} />
                        <CopyButton
                            text={result.mensagem_abertura || ''}
                            className="bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 p-2 rounded-lg transition-colors"
                        />
                    </div>
                </div>
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    <RichTextRenderer content={result.mensagem_abertura} />
                </div>
            </div>

            {/* Roteiro (WhatsApp Style) */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10 relative">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        Roteiro de Conversa (Preview)
                    </h3>
                    <div className="flex items-center gap-2">
                        <WhatsAppButton text={result.roteiro_conversa || ''} />
                        <CopyButton
                            text={result.roteiro_conversa || ''}
                            className="bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 p-2 rounded-lg transition-colors"
                        />
                    </div>
                </div>

                {/* WhatsApp Container */}
                <div className="bg-[#efeae2] p-6 lg:p-8 min-h-[300px] relative">
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

                    <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
                        {(result.roteiro_conversa || '').split('\n').filter((line: string) => line.trim().length > 0).map((line: string, i: number) => {
                            const isStep = /^\d+\./.test(line);
                            const cleanText = line.replace(/^\d+\.\s*/, '');

                            if (!isStep && line.length < 5) return null;

                            return (
                                <div key={i} className="flex justify-end">
                                    <div className="bg-[#dcf8c6] text-gray-800 rounded-lg rounded-tr-none px-4 py-2 shadow-sm max-w-[85%] relative">
                                        {isStep && (
                                            <span className="block text-[10px] font-bold text-green-700 uppercase mb-1 tracking-wide">
                                                Passo {line.split('.')[0]}
                                            </span>
                                        )}
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                            <RichTextRenderer content={isStep ? cleanText : line} />
                                        </div>
                                        <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                                            <span className="text-[10px] text-gray-500">
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Objeções */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    🛡️ Quebra de Objeções
                </h3>
                <div className="space-y-4">
                    {result.respostas_objecoes && Object.entries(result.respostas_objecoes).map(([key, value], index) => {
                        const content = value as string
                        const isLocked = userPlan === 'free' && index >= 3;

                        return (
                            <div key={key} className={`bg-gray-50 rounded-lg p-4 relative group ${isLocked ? 'overflow-hidden' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {key.replace(/_/g, ' ')}
                                    </h4>
                                    {!isLocked && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <WhatsAppButton text={content} />
                                            <CopyButton
                                                text={content}
                                                className="text-gray-400 hover:text-indigo-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={`text-sm text-gray-800 leading-relaxed ${isLocked ? 'filter blur-[6px] select-none opacity-50' : ''}`}>
                                    <RichTextRenderer content={isLocked ? "Conteúdo exclusivo para assinantes. Faça o upgrade para desbloquear todas as objeções e fechar mais vendas." : content} />
                                </div>

                                {isLocked && (
                                    <div
                                        onClick={() => router.push('/app/billing')}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/10 z-10 cursor-pointer hover:bg-gray-50/20 transition-colors"
                                    >
                                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm mb-2">
                                            <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                                            Exclusivo Pro
                                        </span>
                                    </div>
                                )}
                            </div>
                        )

                    })}
                </div>
            </div>

            {/* Follow Up */}
            {result.follow_up && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        🔄 Sugestões de Follow-up
                    </h3>
                    <ul className="space-y-3">
                        {(result.follow_up as string[]).map((msg, i) => (
                            <li key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 hover:bg-indigo-50/50 transition-colors">
                                <span className="font-bold text-xs text-indigo-500 block mb-2 uppercase tracking-wide">Opção {i + 1}</span>
                                {msg}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {onReset && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-shadow shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        Criar Novo Script
                    </button>
                </div>
            )}

        </div>
    )
}

function WhatsAppButton({ text }: { text: string }) {
    const handleShare = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            title="Abrir no WhatsApp"
        >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-semibold sr-only sm:not-sr-only">WhatsApp</span>
        </button>
    )
}
