'use client'

import { useState, useEffect } from 'react'
import { FileText, Copy, Check, ChevronRight, Briefcase, Code, ShoppingCart, Building, Megaphone, X } from 'lucide-react'

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

const categoryColors: Record<string, { bg: string, text: string }> = {
    'SaaS': { bg: 'bg-blue-50', text: 'text-blue-600' },
    'Serviços': { bg: 'bg-purple-50', text: 'text-purple-600' },
    'E-commerce': { bg: 'bg-green-50', text: 'text-green-600' },
    'Consultoria': { bg: 'bg-amber-50', text: 'text-amber-600' },
    'Marketing': { bg: 'bg-pink-50', text: 'text-pink-600' }
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

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 mb-3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                    </div>
                ))}
            </div>
        )
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum template disponível</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([categoria, categoryTemplates]) => {
                const Icon = categoryIcons[categoria] || FileText
                const colors = categoryColors[categoria] || { bg: 'bg-gray-50', text: 'text-gray-600' }

                return (
                    <div key={categoria}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{categoria}</h3>
                            <span className="text-xs text-gray-400">({categoryTemplates.length})</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryTemplates.map(template => (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">{template.nome}</h4>
                                        {template.is_premium && (
                                            <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PRO</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{template.descricao}</p>
                                    <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                                        <span>Ver template</span>
                                        <ChevronRight className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.nome}</h2>
                                <p className="text-sm text-gray-500">{selectedTemplate.categoria}</p>
                            </div>
                            <button onClick={() => setSelectedTemplate(null)}>
                                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Mensagem de Abertura</label>
                                    <button
                                        onClick={() => handleCopy(selectedTemplate.mensagem_abertura, 'abertura')}
                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    >
                                        {copiedId === 'abertura' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedId === 'abertura' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                    {selectedTemplate.mensagem_abertura}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Roteiro de Conversa</label>
                                    <button
                                        onClick={() => handleCopy(selectedTemplate.roteiro_conversa, 'roteiro')}
                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    >
                                        {copiedId === 'roteiro' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedId === 'roteiro' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                    {selectedTemplate.roteiro_conversa}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    onSelectTemplate(selectedTemplate)
                                    setSelectedTemplate(null)
                                }}
                                className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Usar este template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
