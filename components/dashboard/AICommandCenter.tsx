"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowUp, Zap, FileText, Settings, Plus, Image as ImageIcon, Loader2, Megaphone, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Mode = 'script' | 'quick_sales' | 'marketing';

export function AICommandCenter() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeMode, setActiveMode] = useState<Mode>('script');
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Form State
    const [description, setDescription] = useState("");
    const [context, setContext] = useState("WhatsApp");
    const [region, setRegion] = useState("Neutro");
    const [leadType, setLeadType] = useState("morno");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    const handleSubmit = () => {
        if (!description.trim()) return;

        const payload = {
            mode: activeMode,
            name: activeMode === 'script' ? 'Novo Script' : activeMode === 'quick_sales' ? 'Venda Rápida' : 'Campanha Mkt',
            description,
            context: activeMode === 'quick_sales' ? null : context,
            leadType: activeMode === 'quick_sales' ? null : leadType,
            region: activeMode === 'quick_sales' ? null : region,
            imageUrl: activeMode === 'quick_sales' ? null : imagePreview,
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
                if (!description) setIsExpanded(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [description]);

    const isDetailedMode = activeMode === 'script' || activeMode === 'marketing';

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-4xl mx-auto px-4 relative">

            {/* Title */}
            <div className={cn(
                "transition-all duration-500 ease-in-out flex flex-col items-center",
                isExpanded ? "scale-90 opacity-80 mb-8" : "mb-12"
            )}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                    {activeMode === 'script' && "O que posso fazer por você?"}
                    {activeMode === 'quick_sales' && "Venda rápida"}
                    {activeMode === 'marketing' && "Marketing do produto"}
                </h1>
            </div>

            {/* Main Expandable Card */}
            <div
                ref={containerRef}
                className={cn(
                    "w-full bg-white border rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden transition-all duration-500 ease-out",
                    isExpanded && isDetailedMode ? "border-indigo-500/50 ring-4 ring-indigo-500/5 max-w-3xl" :
                        isExpanded && !isDetailedMode ? "border-blue-500/50 ring-4 ring-blue-500/5 max-w-2xl" :
                            "border-gray-200 hover:border-gray-300 max-w-2xl"
                )}
            >
                <div className="p-2">
                    <div className={cn(
                        "flex flex-col md:flex-row gap-4 transition-all duration-500",
                        isExpanded ? "p-4" : "p-2"
                    )}>

                        {/* Image Upload Area - Only for Detailed Modes */}
                        <div className={cn(
                            "shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
                            isExpanded && isDetailedMode ? "w-full md:w-32 h-32 opacity-100 mb-4 md:mb-0" : "w-0 h-0 opacity-0"
                        )}>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="cmd-image-upload"
                                onChange={handleImageChange}
                            />
                            <label
                                htmlFor="cmd-image-upload"
                                className={cn(
                                    "w-full h-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group/image overflow-hidden relative",
                                    imagePreview ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                                )}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 group-hover/image:bg-indigo-200 group-hover/image:text-indigo-600 transition-colors mb-1">
                                            <Plus className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 group-hover/image:text-indigo-500 uppercase tracking-wider">Foto</span>
                                    </>
                                )}
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setImagePreview(null);
                                    }}
                                    className="absolute mt-[-120px] ml-[100px] z-10 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <Plus className="h-3 w-3 rotate-45" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col gap-4">

                            {/* Extra Options - Only for Detailed Modes */}
                            <div className={cn(
                                "grid grid-cols-2 gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
                                isExpanded && isDetailedMode ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0"
                            )}>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-gray-900 text-xs rounded-lg focus:ring-0 focus:border-indigo-500 focus:bg-white block p-2.5 font-medium cursor-pointer"
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                    >
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Instagram DM">Instagram DM</option>
                                        <option value="Email">Email</option>
                                        <option value="Ligação">Ligação</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-gray-900 text-xs rounded-lg focus:ring-0 focus:border-indigo-500 focus:bg-white block p-2.5 font-medium cursor-pointer"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                    >
                                        <option value="Neutro">Neutro (Padrão)</option>
                                        <option value="São Paulo">São Paulo (SP)</option>
                                        <option value="Rio de Janeiro">Rio de Janeiro (RJ)</option>
                                        <option value="Sul">Sul (RS/SC/PR)</option>
                                        <option value="Nordeste">Nordeste</option>
                                    </select>
                                </div>
                            </div>

                            {/* Main Input Area */}
                            <div className="relative w-full">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setIsExpanded(true)}
                                    placeholder={
                                        activeMode === 'script' ? (isExpanded ? "Descreva o produto e público alvo..." : "Descreva seu produto...") :
                                            activeMode === 'quick_sales' ? "Descreva brevente o que quer vender..." :
                                                "Descreva sua estratégia ou produto..."
                                    }
                                    className={cn(
                                        "w-full bg-transparent text-lg text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-all duration-300",
                                        isExpanded ? "min-h-[120px] text-base" : "min-h-[60px] md:min-h-[40px]"
                                    )}
                                />

                                {/* Submit Button */}
                                <div className={cn(
                                    "absolute bottom-0 right-0 flex items-center gap-2 transition-all duration-300",
                                    isExpanded ? "translate-y-2" : ""
                                )}>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!description.trim()}
                                        className={cn(
                                            "p-2 rounded-full transition-all duration-200 flex items-center gap-2",
                                            description.trim()
                                                ? "bg-black text-white hover:bg-gray-800 pr-4"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        )}
                                    >
                                        {isExpanded && description.trim() && <span className="text-sm font-medium pl-2">Gerar</span>}
                                        <ArrowUp className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Footer / Lead Type - Only for Detailed Modes */}
                    <div className={cn(
                        "bg-gray-50 border-t border-gray-100 flex items-center px-6 py-3 transition-all duration-500 ease-in-out gap-4 overflow-hidden",
                        isExpanded && isDetailedMode ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0">Nível do Lead:</span>
                        <div className="flex gap-2">
                            {['frio', 'morno', 'quente'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setLeadType(type)}
                                    className={cn(
                                        "text-xs px-2 py-1 rounded-md capitalize transition-colors border",
                                        leadType === type
                                            ? "bg-white text-indigo-600 border-indigo-200 shadow-sm font-semibold"
                                            : "border-transparent text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
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
                    Criar script
                </button>
                <button
                    onClick={() => { setActiveMode('quick_sales'); setIsExpanded(false); }}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                        activeMode === 'quick_sales'
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                >
                    <Zap className={cn("w-4 h-4", activeMode === 'quick_sales' ? "text-blue-300" : "text-blue-500")} />
                    Vendas Rápidas
                </button>
                <button
                    onClick={() => { setActiveMode('marketing'); setIsExpanded(false); }}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                        activeMode === 'marketing'
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                >
                    <Megaphone className={cn("w-4 h-4", activeMode === 'marketing' ? "text-purple-300" : "text-purple-500")} />
                    Marketing do produto
                </button>
            </div>

        </div>
    );
}

