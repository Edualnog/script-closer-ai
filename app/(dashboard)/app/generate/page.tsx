'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, MessageSquare, Wand2, Zap } from 'lucide-react'
import Link from 'next/link'

import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { CopyButton } from '@/components/ui/CopyButton'
import { TextShimmerWave } from '@/components/ui/TextShimmerWave'

export default function GeneratePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userPlan, setUserPlan] = useState('free') // TODO: fetch real plan context
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<any | null>(null)

    // Use a ref to prevent double-firing strict mode effects if needed, 
    // though for simple fetch it's usually fine.
    const hasTriggered = useRef(false);

    useEffect(() => {
        const processGeneration = async () => {
            if (hasTriggered.current) return;
            hasTriggered.current = true;

            const pendingData = localStorage.getItem('pending_script_generation');

            if (!pendingData) {
                // No intent found, redirect to command center
                router.replace('/app');
                return;
            }

            try {
                const parsed = JSON.parse(pendingData);
                await generateScript(parsed);
            } catch (e) {
                console.error("Failed to parse data", e);
                setError("Erro ao processar dados da tarefa.");
                setLoading(false);
            }
        };

        processGeneration();
    }, [router]);

    const generateScript = async (data: any, refinement?: string) => {
        setLoading(true);
        setError(null);

        try {
            const apiPayload = {
                name: data.name || 'Script Gerado',
                description: data.description,
                context: data.context || 'WhatsApp',
                leadType: data.leadType || 'morno',
                region: data.region || 'Neutro',
                image: data.imageUrl || null,
                // Pass the context if available (for lead_response mode)
                productContext: data.productContext || null,
                refinementInstruction: refinement
            };

            const res = await fetch('/api/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload),
            });

            const textResponse = await res.text();
            let responseData;
            try {
                responseData = JSON.parse(textResponse);
            } catch (err) {
                console.error("Failed to parse JSON response:", textResponse);
                throw new Error(`Resposta inválida do servidor: ${textResponse.substring(0, 100)}${textResponse.length > 100 ? '...' : ''}`);
            }

            if (!res.ok) {
                throw new Error(responseData.error || 'Erro ao gerar script');
            }

            setResult(responseData.result);

            // Optimistic Update: Notify Sidebar immediately
            if (responseData.productId) {
                const event = new CustomEvent('project_created', {
                    detail: {
                        id: responseData.productId,
                        nome: responseData.result.nome_projeto || data.name || 'Novo Script'
                    }
                });
                window.dispatchEvent(event);
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro na geração.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefine = (instruction: string) => {
        const pendingData = localStorage.getItem('pending_script_generation');
        if (pendingData) {
            const parsed = JSON.parse(pendingData);
            generateScript(parsed, instruction);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <TextShimmerWave className='text-3xl font-semibold mb-2'>
                    {result ? "Refinando script..." : "Gerando script..."}
                </TextShimmerWave>
                <p className="mt-2 text-gray-500 max-w-md">
                    Isso pode levar alguns segundos enquanto nossa IA cria a melhor estratégia.
                </p>
            </div>
        );
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

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-sm border border-red-100 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ão foi possível gerar o script</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => router.push('/app')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Dashboard
                </button>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 pt-6">

            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.push('/app')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                </button>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Gerado com sucesso
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seu Script de Vendas</h1>
            <div className="flex flex-wrap items-center gap-2 mb-8">
                <button onClick={() => handleRefine('Resuma o texto, seja mais direto.')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                    <Wand2 className="w-3 h-3" /> Encurtar
                </button>
                <button onClick={() => handleRefine('Seja mais agressivo e focado no fechamento ("Hard Sell").')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium hover:bg-red-100 transition-colors">
                    <Zap className="w-3 h-3" /> Mais Agressivo
                </button>
                <button onClick={() => handleRefine('Seja mais amigável, empático e focado em relacionamento ("Soft Sell").')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors">
                    <MessageSquare className="w-3 h-3" /> Mais Amigável
                </button>
            </div>

            {/* Results Display */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

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

                {/* Roteiro */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            💬 Roteiro de Conversa
                        </h3>
                        <div className="flex items-center gap-2">
                            <WhatsAppButton text={result.roteiro_conversa || ''} />
                            <CopyButton
                                text={result.roteiro_conversa || ''}
                                className="bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 p-2 rounded-lg transition-colors"
                            />
                        </div>
                    </div>
                    <div className="prose prose-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        <RichTextRenderer content={result.roteiro_conversa} />
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

                            return (
                                <div key={key} className="bg-gray-50 rounded-lg p-4 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {key.replace(/_/g, ' ')}
                                        </h4>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <WhatsAppButton text={content} />
                                            <CopyButton
                                                text={content}
                                                className="text-gray-400 hover:text-indigo-600"
                                            />
                                        </div>
                                    </div>
                                    {/* FIXED: Changed p to div to allow nested divs from RichTextRenderer */}
                                    <div className="text-sm text-gray-800 leading-relaxed">
                                        <RichTextRenderer content={content} />
                                    </div>
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

                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => router.push('/app')}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-shadow shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        Criar Novo Script
                    </button>
                </div>

            </div>
        </div>
    )
}

// Helper icons setup
function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
