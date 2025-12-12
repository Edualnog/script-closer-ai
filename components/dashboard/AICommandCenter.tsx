'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Mic, MicOff, ArrowUp, Plus, FileText, MessageCircle, ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"

import { useSubscription } from "@/hooks/useSubscription"
import { ScriptResultDisplay } from "./ScriptResultDisplay";
import { TextShimmerWave } from "@/components/ui/TextShimmerWave";

interface AICommandCenterProps {
    initialChannel?: string;
    initialProduct?: {
        id?: string;
        name: string;
        description: string;
    } | null;
}

export function AICommandCenter({ initialChannel, initialProduct }: AICommandCenterProps) {
    const { plan } = useSubscription();
    const [description, setDescription] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeMode, setActiveMode] = useState<'script' | 'lead_response'>('script');
    const [isListening, setIsListening] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Filter States
    const [leadType, setLeadType] = useState('morno');
    const [leadOrigin, setLeadOrigin] = useState('inbound');
    const [context, setContext] = useState(initialChannel || 'WhatsApp');
    const [region, setRegion] = useState('Neutro');

    const [activeProduct, setActiveProduct] = useState<any | null>(initialProduct || null);

    const containerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Result State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!description.trim()) {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [description]);

    // Load active product context
    useEffect(() => {
        if (initialProduct) {
            setActiveProduct(initialProduct);
        } else {
            const saved = localStorage.getItem("script_closer_active_product");
            if (saved) {
                try {
                    setActiveProduct(JSON.parse(saved));
                } catch (e) { }
            }
        }
    }, [initialProduct]);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'pt-BR';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setDescription(prev => prev + event.results[i][0].transcript + ' ');
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                // if (isListening) recognitionRef.current.start();
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            setIsExpanded(true);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    const generateScript = async (payload: any, refinement?: string) => {
        setLoading(true);
        setError(null);
        setResult(null); // Clear previous result while loading

        try {
            const apiPayload = {
                name: payload.name,
                description: payload.description,
                context: payload.context,
                leadType: payload.leadType,
                leadOrigin: payload.leadOrigin,
                region: payload.region,
                image: payload.imageUrl,
                productContext: payload.productContext,
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
                throw new Error(`Resposta inválida: ${textResponse.substring(0, 50)}...`);
            }

            if (!res.ok) throw new Error(responseData.error || 'Erro ao gerar script');

            setResult(responseData.result);

            // Optimistic Update: Notify Sidebar
            if (responseData.productId) {
                window.dispatchEvent(new CustomEvent('project_created', {
                    detail: { id: responseData.productId, nome: responseData.result.nome_projeto || payload.name }
                }));
            }

            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err: any) {
            setError(err.message || "Ocorreu um erro.");
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = () => {
        if (!description.trim()) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        if (activeMode === 'script') {
            const productContext = { description, timestamp: Date.now() };
            localStorage.setItem("script_closer_active_product", JSON.stringify(productContext));
            setActiveProduct(productContext);
        }

        const payload = {
            mode: activeMode,
            name: activeMode === 'script'
                ? (description.length > 30 ? description.substring(0, 30) + '...' : description)
                : 'Resposta ao Lead',
            description,
            productContext: activeMode === 'lead_response' ? activeProduct : null,
            context, leadType, leadOrigin, region, imageUrl: imagePreview
        };

        // Call generation directly
        generateScript(payload);

        // Collapse input for better view
        setIsExpanded(false);
    };

    const handleRefine = (instruction: string) => {
        const payload = {
            mode: activeMode,
            name: result?.nome_projeto || 'Refinamento',
            description,
            productContext: activeMode === 'lead_response' ? activeProduct : null,
            context, leadType, leadOrigin, region, imageUrl: imagePreview
        };
        generateScript(payload, instruction);
    };

    return (
        <div className="flex flex-col items-center min-h-[85vh] w-full relative pb-20">

            {/* Input Section (Fixed width container) */}
            <div className="w-full max-w-3xl mx-auto px-4 mt-8 md:mt-16 mb-8 relative z-20">
                {/* Title - Only show if NO initial product (Global Mode) */}
                {!initialProduct && (
                    <div className={cn(
                        "transition-all duration-500 ease-in-out flex flex-col items-center",
                        (isExpanded || result) ? "scale-90 opacity-80 mb-6" : "mb-12"
                    )}>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                            {activeMode === 'script' && "O que vamos vender hoje?"}
                            {activeMode === 'lead_response' && "Responder Lead"}
                        </h1>
                    </div>
                )}

                {/* Main Card (Previous Input Logic ...) */}
                {/* ... (Keep existing input rendering logic) ... */}
                <div
                    ref={containerRef}
                    className={cn(
                        "w-full bg-gray-100 border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 ease-out",
                        isExpanded && activeMode === 'script' ? "max-w-5xl" : "max-w-3xl"
                    )}
                >
                    <div className="p-4">
                        <div className="flex flex-col gap-2">

                            {/* Active Product Reminder - Only if NOT initial product (Global Mode) */}
                            {activeMode === 'lead_response' && activeProduct && !initialProduct && (
                                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-white/50 px-3 py-1.5 rounded-full w-fit mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="truncate max-w-[300px] font-medium">
                                        Contexto: {activeProduct.description.substring(0, 30)}...
                                    </span>
                                </div>
                            )}

                            {/* Main Input Area */}

                            {/* Context Warning Overlay for Lead Response */}
                            {activeMode === 'lead_response' && !activeProduct ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                    <div className="p-3 bg-yellow-100 rounded-full mb-3 text-yellow-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-gray-900 font-semibold mb-1">Crie ou selecione um script primeiro</h3>
                                    <p className="text-gray-500 text-sm max-w-sm">
                                        Para a IA responder seu lead, ela precisa saber o que você vende.
                                        Crie um <b>Novo Script</b> ou selecione um existente no menu lateral.
                                    </p>
                                    <button
                                        onClick={() => setActiveMode('script')}
                                        className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide"
                                    >
                                        Voltar para Novo Script
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setIsExpanded(true)}
                                        placeholder={
                                            isListening ? "Ouvindo..." :
                                                activeMode === 'script' ? "Descreva o produto, público alvo ou cole seu texto..." :
                                                    "Cole a mensagem do lead..."
                                        }
                                        className={cn(
                                            "w-full bg-transparent text-gray-900 placeholder:text-gray-500 resize-none outline-none text-base leading-relaxed pl-1",
                                            isExpanded ? "min-h-[60px]" : "min-h-[40px]"
                                        )}
                                    />
                                </div>
                            )}

                            {/* Bottom Toolbar */}
                            <div className="flex items-center justify-between pt-2">

                                {/* Left Tools: Image, Lead Type, Context */}
                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mask-grad-right pb-1 -ml-1 pl-1">

                                    {/* Image Upload (Compact Plus) */}
                                    {activeMode === 'script' && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="cmd-image-upload"
                                                onChange={handleImageChange}
                                            />
                                            <label
                                                htmlFor="cmd-image-upload"
                                                className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer transition-colors"
                                                title="Adicionar imagem"
                                            >
                                                {imagePreview ? (
                                                    <div className="relative w-8 h-8">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                                    </div>
                                                ) : (
                                                    <Plus className="w-5 h-5" />
                                                )}
                                            </label>
                                            <div className="h-6 w-px bg-gray-300 shrink-0" />
                                        </>
                                    )}

                                    {/* Lead Type Grid (Mini) - Only for New Scripts */}
                                    {activeMode === 'script' && (
                                        <div className="flex bg-gray-200/50 rounded-full p-1 shrink-0">
                                            {['frio', 'morno', 'quente'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setLeadType(type)}
                                                    className={cn(
                                                        "text-[10px] px-3 py-1 rounded-full capitalize transition-all font-medium",
                                                        leadType === type
                                                            ? "bg-white text-black shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selectors */}
                                    <div className="flex gap-2 shrink-0">
                                        {/* Lead Origin Selector (New) */}
                                        {activeMode === 'script' && (
                                            <div className="flex bg-gray-200/50 rounded-full p-0.5 shrink-0 items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setLeadOrigin('inbound')}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded-full transition-all font-medium whitespace-nowrap",
                                                        leadOrigin === 'inbound'
                                                            ? "bg-white text-green-700 shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700"
                                                    )}
                                                    title="O cliente entrou em contato comigo"
                                                >
                                                    Lead chamou
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLeadOrigin('outbound')}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded-full transition-all font-medium whitespace-nowrap",
                                                        leadOrigin === 'outbound'
                                                            ? "bg-white text-blue-700 shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700"
                                                    )}
                                                    title="Eu vou entrar em contato com o cliente"
                                                >
                                                    Vou abordar
                                                </button>
                                            </div>
                                        )}

                                        <select
                                            className="appearance-none bg-gray-200/50 hover:bg-gray-200 transition-colors text-gray-600 text-[11px] rounded-full py-1.5 px-3 font-medium cursor-pointer outline-none border-none"
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                        >
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="Instagram DM">Instagram DM</option>
                                            <option value="Email">Email</option>
                                            <option value="Ligação">Ligação</option>
                                        </select>

                                        <select
                                            className="appearance-none bg-gray-200/50 hover:bg-gray-200 transition-colors text-gray-600 text-[11px] rounded-full py-1.5 px-3 font-medium cursor-pointer outline-none border-none"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                        >
                                            <option value="Neutro">Neutro</option>
                                            <option value="São Paulo">São Paulo</option>
                                            <option value="Rio de Janeiro">Rio de Janeiro</option>
                                            <option value="Sul">Sul</option>
                                            <option value="Nordeste">Nordeste</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Right Actions: Mic & Send */}
                                <div className="flex items-center gap-2 pl-2">
                                    <button
                                        onClick={toggleListening}
                                        className={cn(
                                            "p-2 rounded-full transition-all duration-200",
                                            isListening
                                                ? "bg-red-100 text-red-600 animate-pulse"
                                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!description.trim()}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                                            description.trim()
                                                ? "bg-black text-white hover:bg-gray-800 hover:scale-105"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        )}
                                    >
                                        <ArrowUp className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {!result && !loading && (
                    <div className={cn(
                        "flex flex-wrap items-center justify-center gap-3 mt-8 transition-opacity duration-500",
                    )}>
                        <button
                            onClick={() => { setActiveMode('script'); setIsExpanded(false); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                                activeMode === 'script'
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            <FileText className={cn("w-4 h-4", activeMode === 'script' ? "text-yellow-300" : "text-yellow-500")} />
                            Criar novo script
                        </button>
                        <button
                            onClick={() => { setActiveMode('lead_response'); setIsExpanded(false); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                                activeMode === 'lead_response'
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            <MessageCircle className={cn("w-4 h-4", activeMode === 'lead_response' ? "text-purple-300" : "text-purple-500")} />
                            Responder Lead
                        </button>
                    </div>
                )}
            </div>

            {/* Results Section */}
            <div ref={resultRef} className="w-full max-w-5xl px-4 min-h-[200px]">

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <TextShimmerWave className='text-2xl font-semibold mb-2'>
                            {result ? "Refinando script..." : "Gerando a melhor estratégia..."}
                        </TextShimmerWave>
                        <p className="text-gray-500">Isto pode levar alguns segundos.</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center my-8">
                        {error}
                        <button onClick={handleSubmit} className="block mx-auto mt-2 underline">Tentar novamente</button>
                    </div>
                )}

                {result && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Scroll Indicator (Only if just generated) */}
                        <div className="flex justify-center mb-8 animate-bounce">
                            <ChevronDown className="w-8 h-8 text-indigo-400" />
                        </div>

                        <ScriptResultDisplay
                            result={result}
                            userPlan={plan}
                            handleRefine={handleRefine}
                            onReset={() => {
                                setResult(null);
                                setDescription("");
                                setIsExpanded(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}
            </div>

        </div>
    );
}
