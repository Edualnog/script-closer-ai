'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, ArrowUp, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function HeroProductForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Form State
    const [description, setDescription] = useState('')
    const [context, setContext] = useState('WhatsApp')
    const [region, setRegion] = useState('Neutro')
    const [leadType, setLeadType] = useState('morno')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [isExpanded, setIsExpanded] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)

    const supabase = createClient()

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
            setIsExpanded(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            if (event.results[event.resultIndex].isFinal) {
                setDescription(prev => prev + ' ' + event.results[event.resultIndex][0].transcript);
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
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!description.trim()) return

        setLoading(true)

        // Stop recording
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        try {
            let imageUrl = null

            // 1. Upload Image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, imageFile)

                if (uploadError) {
                    console.error('Upload failed:', uploadError)
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(fileName)
                    imageUrl = publicUrl
                }
            }

            // 2. Save payload to localStorage
            const payload = {
                name: 'Produto Inicial',
                description: description,
                context: context,
                leadType: leadType,
                region: region,
                imageUrl: imageUrl, // Can be local preview if upload fails or is skipped for speed, but ideally public URL
                // Note: passing local preview-only might fail if cleared, but for hero gen usually we want persistence.
                // If upload failed, imageUrl is null.
                timestamp: Date.now()
            }

            localStorage.setItem('pending_script_generation', JSON.stringify(payload))

            // 3. Redirect
            router.push('/register?source=hero_gen')

        } catch (error) {
            console.error('Error processing form:', error)
            setLoading(false)
        }
    }

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
    }, [description, isListening]);

    return (
        <div className="flex flex-col items-center justify-center max-w-3xl mx-auto px-4 relative mb-12 w-full">
            <div
                ref={containerRef}
                className={cn(
                    "w-full bg-gray-100 border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 ease-out text-left",
                    isExpanded ? "scale-105 shadow-md" : ""
                )}
            >
                <div className="p-4">
                    <div className="flex flex-col gap-2">

                        {/* Main Input Area */}
                        <div className="relative w-full">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsExpanded(true)}
                                placeholder={isListening ? "Ouvindo..." : "Cole aqui sua oferta ou descreva seu produto em 2–3 frases..."}
                                className={cn(
                                    "w-full bg-transparent text-gray-900 placeholder:text-gray-500 resize-none outline-none text-base leading-relaxed pl-1",
                                    isExpanded ? "min-h-[80px]" : "min-h-[40px]"
                                )}
                            />
                        </div>

                        {/* Bottom Toolbar */}
                        <div className="flex items-center justify-between pt-2">

                            {/* Left Tools: Image, Lead Type, Context */}
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mask-grad-right pb-1 -ml-1 pl-1">

                                {/* Image Upload (Compact Plus) */}
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="hero-image-upload"
                                        onChange={handleImageChange}
                                    />
                                    <label
                                        htmlFor="hero-image-upload"
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

                                {/* Lead Type Grid (Mini) */}
                                <div className="flex bg-gray-200/50 rounded-full p-1 shrink-0">
                                    {['frio', 'morno', 'quente'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
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

                                {/* Selectors */}
                                <div className="flex gap-2 shrink-0">
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
                                        {/* Added generic options to match simple view */}
                                        <option value="Sul">Sul</option>
                                        <option value="Nordeste">Nordeste</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Actions: Mic & Send */}
                            <div className="flex items-center gap-2 pl-2">
                                <button
                                    type="button"
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
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    disabled={!description.trim() || loading}
                                    className={cn(
                                        "h-10 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm font-medium text-sm",
                                        description.trim()
                                            ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Começar grátis</span>}
                                    {!loading && <ArrowUp className="w-4 h-4" />}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <p className="flex items-center gap-2 text-xs text-gray-500 mt-4 text-center font-medium">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                3 scripts grátis por mês • Sem cartão de crédito
            </p>
        </div>
    )
}
