"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowUp, FileText, Settings, Plus, Image as ImageIcon, Loader2, Megaphone, Gauge, MessageCircle, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Mode = 'script' | 'lead_response';

interface AICommandCenterProps {
    initialContext?: {
        id?: string;
        name?: string;
        description: string;
    } | null;
}

export function AICommandCenter({ initialContext }: AICommandCenterProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeMode, setActiveMode] = useState<Mode>('script');
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Form State
    const [scriptInput, setScriptInput] = useState("");
    const [leadInput, setLeadInput] = useState("");

    // Derived state for current mode
    const description = activeMode === 'script' ? scriptInput : leadInput;
    const setDescription = (value: string) => {
        if (activeMode === 'script') setScriptInput(value);
        else setLeadInput(value);
    };

    const [context, setContext] = useState("WhatsApp");
    const [region, setRegion] = useState("Neutro");
    const [leadType, setLeadType] = useState("morno");
    const [leadOrigin, setLeadOrigin] = useState<'inbound' | 'outbound'>('inbound');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Seu navegador não suporta voz. Tente usar o Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setIsExpanded(true); // Auto expand when speaking
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (event.results[event.resultIndex].isFinal) {
                setDescription((activeMode === 'script' ? scriptInput : leadInput) + ' ' + event.results[event.resultIndex][0].transcript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Active Product State (Scoped)
    const [activeProduct, setActiveProduct] = useState<{ description: string } | null>(initialContext || null);

    const handleSubmit = () => {
        if (!description.trim()) return;

        // Auto-stop recording if active
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        // If creating a new script, save as the Active Product
        if (activeMode === 'script') {
            const productContext = { description, timestamp: Date.now() };
            localStorage.setItem("script_closer_active_product", JSON.stringify(productContext));
            setActiveProduct(productContext);
        }

        const payload = {
            mode: activeMode,
            name: activeMode === 'script' ? 'Novo Script' : 'Resposta ao Lead',
            description, // For lead_response, this is the message. For script, this is the product.
            // If responding, we pass the active product context
            productContext: activeMode === 'lead_response' ? activeProduct : null,

            context: context,
            leadType: leadType,
            leadOrigin: leadOrigin,
            region: region,
            imageUrl: imagePreview,
            imageFile: null,
            timestamp: Date.now()
        };

        localStorage.setItem("pending_script_generation", JSON.stringify(payload));
        router.push("/app/generate");
    };

    // Close expansion if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!description && !isListening) setIsExpanded(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [description, isListening, activeMode]); // Add activeMode dependency

    const isDetailedMode = activeMode === 'script' || activeMode === 'lead_response';

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-4xl mx-auto px-4 relative">

            {/* Title */}
            <div className={cn(
                "transition-all duration-500 ease-in-out flex flex-col items-center",
                isExpanded ? "scale-90 opacity-80 mb-8" : "mb-12"
            )}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                    {activeMode === 'script' && "O que vamos vender hoje?"}
                    {activeMode === 'lead_response' && "Responder Lead"}
                </h1>
            </div>

            {/* Main Expandable Card */}
            <div
                ref={containerRef}
                className={cn(
                    "w-full bg-gray-100 border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 ease-out",
                    isExpanded && activeMode === 'script' ? "max-w-6xl" : "max-w-4xl"
                )}
            >
                <div className="p-4">
                    <div className="flex flex-col gap-2">

                        {/* Active Product Reminder */}
                        {activeMode === 'lead_response' && activeProduct && (
                            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-white/50 px-3 py-1.5 rounded-full w-fit mb-1">
                                <Sparkles className="w-3 h-3" />
                                <span className="truncate max-w-[300px] font-medium">
                                    Contexto: {activeProduct.description.substring(0, 30)}...
                                </span>
                            </div>
                        )}

                        {/* Main Input Area */}
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
                                        isExpanded ? "min-h-[80px]" : "min-h-[40px]"
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

            {/* Mode Switches (Shortcuts) */}
            <div className={cn(
                "flex flex-wrap items-center justify-center gap-3 mt-8 transition-opacity duration-500",
                // isExpanded ? "opacity-0 pointer-events-none" : "opacity-100" // Optional: Keep visible or hide? User wants to "maintain buttons". Usually clicking one selects it.
                // Let's keep them visible but active one highlighted.
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

        </div>
    );
}
