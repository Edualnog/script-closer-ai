'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Users,
    Send,
    Pause,
    Play,
    X,
    Filter,
    Sparkles,
    Clock,
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    MessageSquare,
    Package,
    AlertTriangle
} from 'lucide-react'
import { useWhatsApp } from './WhatsAppConnect'

interface Lead {
    id: string
    nome: string
    contato: string
    status: string
    notas?: string
    conversation_history?: Array<{ type: string, content: string, timestamp: string }>
}

interface Product {
    id: string
    name: string
    description?: string
}

interface CampaignStatus {
    status: 'idle' | 'running' | 'paused' | 'completed'
    total: number
    sent: number
    failed: number
    currentLead?: string
}

export default function BulkMessaging() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>('')
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
    const [message, setMessage] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string[]>(['novo', 'em_conversa'])
    const [minDelay, setMinDelay] = useState(45)
    const [maxDelay, setMaxDelay] = useState(90)
    const [safeMode, setSafeMode] = useState(true)
    const [campaign, setCampaign] = useState<CampaignStatus>({
        status: 'idle',
        total: 0,
        sent: 0,
        failed: 0
    })
    const [countdown, setCountdown] = useState(0)
    const campaignRef = useRef(campaign)

    const { isConnected, checkConnection, sendMessage } = useWhatsApp()

    useEffect(() => {
        campaignRef.current = campaign
    }, [campaign])

    useEffect(() => {
        fetchLeads()
        fetchProducts()
        checkConnection()
    }, [])

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads')
            if (res.ok) {
                const data = await res.json()
                setLeads(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            setLeads([])
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            setProducts([])
        }
    }

    const filteredLeads = leads.filter(lead =>
        statusFilter.includes(lead.status) && lead.contato
    )

    const toggleLead = (leadId: string) => {
        const newSelected = new Set(selectedLeads)
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId)
        } else {
            newSelected.add(leadId)
        }
        setSelectedLeads(newSelected)
    }

    const selectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set())
        } else {
            setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
        }
    }

    const generateMessage = async () => {
        if (!selectedProduct) return
        const product = products.find(p => p.id === selectedProduct)
        if (!product) return

        setIsGenerating(true)
        try {
            const res = await fetch('/api/bulk-send/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: product.name,
                    productDescription: product.description
                })
            })
            if (res.ok) {
                const data = await res.json()
                setMessage(data.message)
            }
        } catch (error) {
            console.error('Error generating message:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const startCampaign = async () => {
        if (!isConnected || selectedLeads.size === 0 || !message.trim()) return

        setCampaign({
            status: 'running',
            total: selectedLeads.size,
            sent: 0,
            failed: 0
        })

        const leadsToSend = leads.filter(l => selectedLeads.has(l.id))

        for (let i = 0; i < leadsToSend.length; i++) {
            const lead = leadsToSend[i]
            if (campaignRef.current.status === 'paused') break

            setCampaign(prev => ({ ...prev, currentLead: lead.nome }))

            try {
                const personalizedMessage = message.replace(/{nome}/gi, lead.nome)
                const success = await sendMessage(lead.contato, personalizedMessage)

                if (success) {
                    setCampaign(prev => ({ ...prev, sent: prev.sent + 1 }))
                    await fetch('/api/leads', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: lead.id,
                            conversation_history: [
                                ...(lead.conversation_history || []),
                                { type: 'you', content: personalizedMessage, timestamp: new Date().toISOString() }
                            ]
                        })
                    })
                } else {
                    setCampaign(prev => ({ ...prev, failed: prev.failed + 1 }))
                }
            } catch {
                setCampaign(prev => ({ ...prev, failed: prev.failed + 1 }))
            }

            if (i < leadsToSend.length - 1) {
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000
                const extraPause = safeMode && (i + 1) % 20 === 0 ? 300000 : 0
                const totalDelay = delay + extraPause

                for (let sec = Math.floor(totalDelay / 1000); sec > 0; sec--) {
                    setCountdown(sec)
                    await new Promise(r => setTimeout(r, 1000))
                }
                setCountdown(0)
            }
        }

        setCampaign(prev => ({ ...prev, status: 'completed', currentLead: undefined }))
    }

    const togglePause = () => {
        setCampaign(prev => ({
            ...prev,
            status: prev.status === 'running' ? 'paused' : 'running'
        }))
    }

    const cancelCampaign = () => {
        setCampaign({ status: 'idle', total: 0, sent: 0, failed: 0 })
        setCountdown(0)
    }

    const toggleStatusFilter = (status: string) => {
        if (statusFilter.includes(status)) {
            setStatusFilter(statusFilter.filter(s => s !== status))
        } else {
            setStatusFilter([...statusFilter, status])
        }
    }

    const statusConfig: Record<string, { label: string, color: string }> = {
        novo: { label: 'Novo', color: 'bg-emerald-100 text-emerald-700' },
        em_conversa: { label: 'Em Conversa', color: 'bg-amber-100 text-amber-700' },
        convertido: { label: 'Convertido', color: 'bg-blue-100 text-blue-700' },
        perdido: { label: 'Perdido', color: 'bg-gray-100 text-gray-600' }
    }

    const progress = campaign.total > 0 ? (campaign.sent / campaign.total) * 100 : 0

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Disparos em Massa</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Envie mensagens personalizadas para múltiplos leads
                    </p>
                </div>

                {/* WhatsApp Status */}
                {!isConnected && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-800 text-sm">WhatsApp não conectado</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Product */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Package className="w-4 h-4 text-gray-400" />
                                Produto/Serviço
                            </label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="">Selecione um produto</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filters */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Filter className="w-4 h-4 text-gray-400" />
                                Filtrar por Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(statusConfig).map(([key, { label, color }]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleStatusFilter(key)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter.includes(key)
                                                ? color
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Leads */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Leads ({selectedLeads.size}/{filteredLeads.length})
                                </span>
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                    {selectedLeads.size === filteredLeads.length ? 'Desmarcar' : 'Selecionar todos'}
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2">
                                {filteredLeads.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">Nenhum lead encontrado</p>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredLeads.map(lead => (
                                            <label
                                                key={lead.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedLeads.has(lead.id)
                                                        ? 'bg-gray-900 text-white'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.has(lead.id)}
                                                    onChange={() => toggleLead(lead.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${selectedLeads.has(lead.id) ? 'text-white' : 'text-gray-900'}`}>
                                                        {lead.nome}
                                                    </p>
                                                    <p className={`text-xs truncate ${selectedLeads.has(lead.id) ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {lead.contato}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs ${selectedLeads.has(lead.id)
                                                        ? 'bg-white/20 text-white'
                                                        : statusConfig[lead.status]?.color
                                                    }`}>
                                                    {statusConfig[lead.status]?.label || lead.status}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Message */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    Mensagem
                                </label>
                                <button
                                    onClick={generateMessage}
                                    disabled={isGenerating || !selectedProduct}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Gerar com IA
                                </button>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite sua mensagem... Use {nome} para personalizar"
                                rows={5}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Use <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{'{nome}'}</code> para inserir o nome automaticamente
                            </p>
                        </div>

                        {/* Config */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                Intervalo entre envios
                            </label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Mínimo (seg)</label>
                                    <input
                                        type="number"
                                        value={minDelay}
                                        onChange={(e) => setMinDelay(Number(e.target.value))}
                                        min={30}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Máximo (seg)</label>
                                    <input
                                        type="number"
                                        value={maxDelay}
                                        onChange={(e) => setMaxDelay(Number(e.target.value))}
                                        min={30}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={safeMode}
                                    onChange={(e) => setSafeMode(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                                <Shield className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-sm text-gray-900">Modo Seguro</span>
                                    <span className="text-xs text-gray-500 block">Pausa de 5min a cada 20 mensagens</span>
                                </div>
                            </label>
                        </div>

                        {/* Progress */}
                        {campaign.status !== 'idle' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-900">
                                        {campaign.status === 'running' && 'Enviando...'}
                                        {campaign.status === 'paused' && 'Pausado'}
                                        {campaign.status === 'completed' && 'Concluído'}
                                    </span>
                                    {campaign.currentLead && (
                                        <span className="text-xs text-gray-500">{campaign.currentLead}</span>
                                    )}
                                </div>

                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-gray-900 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <CheckCircle className="w-4 h-4" />
                                            {campaign.sent}
                                        </span>
                                        <span className="flex items-center gap-1 text-red-500">
                                            <XCircle className="w-4 h-4" />
                                            {campaign.failed}
                                        </span>
                                        <span className="text-gray-400">de {campaign.total}</span>
                                    </div>
                                    {countdown > 0 && campaign.status === 'running' && (
                                        <span className="text-gray-500">Próximo: {countdown}s</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            {campaign.status === 'idle' ? (
                                <button
                                    onClick={startCampaign}
                                    disabled={!isConnected || selectedLeads.size === 0 || !message.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Iniciar Disparo ({selectedLeads.size})
                                </button>
                            ) : campaign.status === 'completed' ? (
                                <button
                                    onClick={cancelCampaign}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Novo Disparo
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={togglePause}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${campaign.status === 'paused'
                                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}
                                    >
                                        {campaign.status === 'paused' ? (
                                            <><Play className="w-4 h-4" /> Continuar</>
                                        ) : (
                                            <><Pause className="w-4 h-4" /> Pausar</>
                                        )}
                                    </button>
                                    <button
                                        onClick={cancelCampaign}
                                        className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
