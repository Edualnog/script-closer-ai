'use client'

import { useState, useEffect } from 'react'
import { FileText, Copy, Check, ChevronRight, Briefcase, Code, ShoppingCart, Building, Megaphone, X, Sparkles, MessageSquare, ListOrdered } from 'lucide-react'

interface Template {
    id: string
    nome: string
    categoria: string
    descricao: string
    mensagem_abertura: string
    roteiro_conversa: string
    is_premium: boolean
}

interface TemplateLibraryProps {
    onSelectTemplate: (template: Template) => void
}

const categoryIcons: Record<string, any> = {
    'SaaS': Code,
    'Serviços': Briefcase,
    'E-commerce': ShoppingCart,
    'Consultoria': Building,
    'Marketing': Megaphone
}

const categoryColors: Record<string, { bg: string, text: string, gradient: string, border: string }> = {
    'SaaS': { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-200' },
    'Serviços': { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-600', border: 'border-purple-200' },
    'E-commerce': { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-200' },
    'Consultoria': { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-200' },
    'Marketing': { bg: 'bg-pink-50', text: 'text-pink-600', gradient: 'from-pink-500 to-rose-600', border: 'border-pink-200' }
}

export function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates')
                if (res.ok) {
                    const data = await res.json()
                    setTemplates(data.templates)
                }
            } catch (error) {
                console.error('Error fetching templates:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTemplates()
    }, [])

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Group templates by category
    const grouped = templates.reduce((acc, template) => {
        if (!acc[template.categoria]) {
            acc[template.categoria] = []
        }
        acc[template.categoria].push(template)
        return acc
    }, {} as Record<string, Template[]>)

    // Parse roteiro into steps
    const parseRoteiro = (text: string) => {
        return text.split(/\n|\\n/).filter(line => line.trim().length > 0)
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                    </div>
                ))}
            </div>
        )
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Nenhum template disponível</p>
                <p className="text-gray-400 text-sm mt-1">Em breve teremos novos templates</p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {Object.entries(grouped).map(([categoria, categoryTemplates]) => {
                const Icon = categoryIcons[categoria] || FileText
                const colors = categoryColors[categoria] || { bg: 'bg-gray-50', text: 'text-gray-600', gradient: 'from-gray-500 to-gray-600', border: 'border-gray-200' }

                return (
                    <div key={categoria}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{categoria}</h3>
                                <p className="text-xs text-gray-500">{categoryTemplates.length} template{categoryTemplates.length > 1 ? 's' : ''} disponível</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {categoryTemplates.map(template => (
                                <div
                                    key={template.id}
                                    className={`group relative bg-white rounded-2xl border ${colors.border} p-5 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    {/* Gradient accent */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{template.nome}</h4>
                                                <p className="text-xs text-gray-400">{categoria}</p>
                                            </div>
                                        </div>
                                        {template.is_premium && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full shadow-sm">
                                                <Sparkles className="w-3 h-3" />
                                                PRO
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px]">{template.descricao}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>Mensagem pronta</span>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium ${colors.text} group-hover:translate-x-1 transition-transform`}>
                                            <span>Ver</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Header with gradient */}
                        <div className={`relative bg-gradient-to-r ${categoryColors[selectedTemplate.categoria]?.gradient || 'from-gray-500 to-gray-600'} p-6 text-white`}>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    {(() => {
                                        const Icon = categoryIcons[selectedTemplate.categoria] || FileText
                                        return <Icon className="w-7 h-7" />
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedTemplate.nome}</h2>
                                    <p className="text-white/80 text-sm">{selectedTemplate.categoria} • {selectedTemplate.descricao}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Mensagem de Abertura */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                        <label className="text-sm font-semibold text-gray-700">Mensagem de Abertura</label>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(selectedTemplate.mensagem_abertura, 'abertura')}
                                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copiedId === 'abertura'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                                            }`}
                                    >
                                        {copiedId === 'abertura' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedId === 'abertura' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                    {selectedTemplate.mensagem_abertura}
                                </div>
                            </div>

                            {/* Roteiro de Conversa */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ListOrdered className="w-4 h-4 text-gray-500" />
                                        <label className="text-sm font-semibold text-gray-700">Roteiro de Conversa</label>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(selectedTemplate.roteiro_conversa, 'roteiro')}
                                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copiedId === 'roteiro'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                                            }`}
                                    >
                                        {copiedId === 'roteiro' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedId === 'roteiro' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    {parseRoteiro(selectedTemplate.roteiro_conversa).map((step, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 p-4 ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${categoryColors[selectedTemplate.categoria]?.gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
                                                <span className="text-xs font-bold text-white">{index + 1}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{step.replace(/^Passo \d+:\s*/i, '')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    onSelectTemplate(selectedTemplate)
                                    setSelectedTemplate(null)
                                }}
                                className={`w-full py-3 bg-gradient-to-r ${categoryColors[selectedTemplate.categoria]?.gradient || 'from-gray-700 to-gray-900'} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Usar este template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
