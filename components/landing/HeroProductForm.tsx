'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import { createClient } from '@/lib/supabase/client'

export function HeroProductForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        description: '',
        context: 'WhatsApp',
        leadType: 'morno',
        region: 'Neutro',
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const supabase = createClient()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

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
                description: data.description,
                context: data.context,
                leadType: data.leadType,
                region: data.region,
                imageUrl: imageUrl,
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

    return (
        <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSubmit} className="relative group text-left">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-2 md:p-3">

                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Photo Upload */}
                        <div className="shrink-0 relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="hero-image-upload"
                                onChange={handleImageChange}
                            />
                            <label
                                htmlFor="hero-image-upload"
                                className={cn(
                                    "w-full md:w-28 h-28 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group/image overflow-hidden relative",
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
                                        e.preventDefault()
                                        setImagePreview(null)
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <Plus className="h-3 w-3 rotate-45" />
                                </button>
                            )}
                        </div>

                        {/* Inputs Container */}
                        <div className="flex-1 space-y-4">
                            {/* Top Row: Context & Region */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Onde vai vender?</span>
                                    </div>
                                    <select
                                        className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-gray-900 text-sm rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white block p-3 font-medium cursor-pointer"
                                        value={data.context}
                                        onChange={(e) => setData({ ...data, context: e.target.value })}
                                    >
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Instagram DM">Instagram DM</option>
                                        <option value="Email">Email</option>
                                        <option value="Ligação">Ligação</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 mt-6">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Região / Sotaque</span>
                                    </div>
                                    <select
                                        className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-gray-900 text-sm rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white block p-3 font-medium cursor-pointer"
                                        value={data.region}
                                        onChange={(e) => setData({ ...data, region: e.target.value })}
                                    >
                                        <option value="Neutro">Neutro (Padrão)</option>
                                        <option value="São Paulo">São Paulo (SP)</option>
                                        <option value="Rio de Janeiro">Rio de Janeiro (RJ)</option>
                                        <option value="Minas Gerais">Minas Gerais (MG)</option>
                                        <option value="Sul">Sul (RS/SC/PR)</option>
                                        <option value="Nordeste">Nordeste</option>
                                        <option value="Norte">Norte</option>
                                        <option value="Centro-Oeste">Centro-Oeste</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 mt-6">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Type - Grouped with Description or Own Row */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nível do Lead</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl">
                                    {['frio', 'morno', 'quente'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setData({ ...data, leadType: type })}
                                            className={cn(
                                                "py-2 text-xs font-semibold rounded-lg capitalize transition-all",
                                                data.leadType === type
                                                    ? "bg-white text-indigo-600 shadow-sm"
                                                    : "text-gray-400 hover:text-gray-600"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">O que está vendendo?</span>
                                </div>
                                <textarea
                                    className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 focus:bg-white focus:ring-0 focus:border-indigo-500 resize-none min-h-[100px] placeholder-gray-400/80 transition-all font-medium"
                                    placeholder="Ex: Tênis de corrida leve, ideal para maratonas. Público alvo são homens de 30-50 anos..."
                                    required
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button (Integrated) */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-xs text-gray-400 pl-1">
                            *Preencha para testar a IA
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !data.description}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#171717] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-500/10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Processando...
                                </>
                            ) : (
                                'Gerar Script Grátis'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
