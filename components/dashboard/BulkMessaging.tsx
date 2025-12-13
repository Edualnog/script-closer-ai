'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
    AlertTriangle,
    Zap,
    ChevronRight
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
    nextSendIn?: number
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
            console.error('Error fetching leads:', error)
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
            console.error('Error fetching products:', error)
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
        if (!selectedProduct) {
            alert('Selecione um produto primeiro')
            return
        }

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
        if (!isConnected) {
            alert('Conecte o WhatsApp primeiro!')
            return
        }

        if (selectedLeads.size === 0) {
            alert('Selecione pelo menos um lead')
            return
        }

        if (!message.trim()) {
            alert('Digite ou gere uma mensagem')
            return
        }

        setCampaign({
            status: 'running',
            total: selectedLeads.size,
            sent: 0,
            failed: 0
        })

        const leadsToSend = leads.filter(l => selectedLeads.has(l.id))

        for (let i = 0; i < leadsToSend.length; i++) {
            const lead = leadsToSend[i]

            if (campaignRef.current.status === 'paused') {
                break
            }

            setCampaign(prev => ({
                ...prev,
                currentLead: lead.nome
            }))

            try {
                const personalizedMessage = message.replace(/{nome}/gi, lead.nome)
                const success = await sendMessage(lead.contato, personalizedMessage)

                if (success) {
                    setCampaign(prev => ({
                        ...prev,
                        sent: prev.sent + 1
                    }))

                    await fetch('/api/leads', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: lead.id,
                            conversation_history: [
                                ...(lead.conversation_history || []),
                                {
                                    type: 'you',
                                    content: personalizedMessage,
                                    timestamp: new Date().toISOString()
                                }
                            ]
                        })
                    })
                } else {
                    setCampaign(prev => ({
                        ...prev,
                        failed: prev.failed + 1
                    }))
                }
            } catch (error) {
                setCampaign(prev => ({
                    ...prev,
                    failed: prev.failed + 1
                }))
            }

            if (i < leadsToSend.length - 1) {
                const delay = Math.floor(
                    Math.random() * (maxDelay - minDelay + 1) + minDelay
                ) * 1000

                const extraPause = safeMode && (i + 1) % 20 === 0 ? 300000 : 0

                const totalDelay = delay + extraPause

                for (let sec = Math.floor(totalDelay / 1000); sec > 0; sec--) {
                    setCountdown(sec)
                    await new Promise(r => setTimeout(r, 1000))
                }
                setCountdown(0)
            }
        }

        setCampaign(prev => ({
            ...prev,
            status: 'completed',
            currentLead: undefined
        }))
    }

    const togglePause = () => {
        setCampaign(prev => ({
            ...prev,
            status: prev.status === 'running' ? 'paused' : 'running'
        }))
    }

    const cancelCampaign = () => {
        setCampaign({
            status: 'idle',
            total: 0,
            sent: 0,
            failed: 0
        })
        setCountdown(0)
    }

    const toggleStatusFilter = (status: string) => {
        if (statusFilter.includes(status)) {
            setStatusFilter(statusFilter.filter(s => s !== status))
        } else {
            setStatusFilter([...statusFilter, status])
        }
    }

    const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
        novo: { label: 'Novo', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
        em_conversa: { label: 'Em Conversa', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
        convertido: { label: 'Convertido', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
        perdido: { label: 'Perdido', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' }
    }

    const progress = campaign.total > 0 ? (campaign.sent / campaign.total) * 100 : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Disparos em Massa
                        </h1>
                    </div>
                    <p className="text-slate-400 ml-14">
                        Envie mensagens personalizadas para múltiplos leads automaticamente
                    </p>
                </div>

                {/* WhatsApp Status Banner */}
                {!isConnected && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span className="text-amber-200">WhatsApp não conectado. Conecte para iniciar os disparos.</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Configuration */}
                    <div className="col-span-12 lg:col-span-5 space-y-5">
                        {/* Product Card */}
                        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                                <Package className="w-4 h-4 text-violet-400" />
                                <span className="text-sm font-medium text-slate-200">Produto/Serviço</span>
                            </div>
                            <div className="p-5">
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                                >
                                    <option value="">Selecione um produto</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Filter Card */}
                        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-violet-400" />
                                <span className="text-sm font-medium text-slate-200">Filtrar por Status</span>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(statusConfig).map(([key, { label, bg }]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleStatusFilter(key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${statusFilter.includes(key)
                                                    ? bg + ' text-white'
                                                    : 'bg-slate-900/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Leads Card */}
                        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-medium text-slate-200">
                                        Leads
                                        <span className="ml-2 text-slate-400">
                                            ({selectedLeads.size} de {filteredLeads.length})
                                        </span>
                                    </span>
                                </div>
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    {selectedLeads.size === filteredLeads.length ? 'Desmarcar' : 'Selecionar todos'}
                                </button>
                            </div>
                            <div className="p-3 max-h-72 overflow-y-auto">
                                {filteredLeads.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">
                                        Nenhum lead encontrado
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredLeads.map(lead => (
                                            <label
                                                key={lead.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedLeads.has(lead.id)
                                                        ? 'bg-violet-500/20 border border-violet-500/30'
                                                        : 'bg-slate-900/30 border border-transparent hover:bg-slate-900/50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.has(lead.id)}
                                                    onChange={() => toggleLead(lead.id)}
                                                    className="w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-violet-500/50 bg-slate-900"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {lead.nome}
                                                    </p>
                                                    <p className="text-slate-500 text-xs truncate">
                                                        {lead.contato}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-lg text-xs border ${statusConfig[lead.status]?.bg || 'bg-slate-700'} ${statusConfig[lead.status]?.color || 'text-slate-300'}`}>
                                                    {statusConfig[lead.status]?.label || lead.status}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Message & Actions */}
                    <div className="col-span-12 lg:col-span-7 space-y-5">
                        {/* Message Card */}
                        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-medium text-slate-200">Mensagem</span>
                                </div>
                                <button
                                    onClick={generateMessage}
                                    disabled={isGenerating || !selectedProduct}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Gerar com IA
                                </button>
                            </div>
                            <div className="p-5">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Digite sua mensagem... Use {nome} para personalizar"
                                    rows={6}
                                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-violet-400" />
                                    Use <code className="bg-slate-900 px-1.5 py-0.5 rounded text-violet-300">{'{nome}'}</code> para inserir o nome automaticamente
                                </p>
                            </div>
                        </div>

                        {/* Config Card */}
                        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-violet-400" />
                                <span className="text-sm font-medium text-slate-200">Configurações de Envio</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-2">Delay Mínimo (seg)</label>
                                        <input
                                            type="number"
                                            value={minDelay}
                                            onChange={(e) => setMinDelay(Number(e.target.value))}
                                            min={30}
                                            max={300}
                                            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-2">Delay Máximo (seg)</label>
                                        <input
                                            type="number"
                                            value={maxDelay}
                                            onChange={(e) => setMaxDelay(Number(e.target.value))}
                                            min={30}
                                            max={300}
                                            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/30 border border-slate-700/50 cursor-pointer hover:bg-slate-900/50 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={safeMode}
                                        onChange={(e) => setSafeMode(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/50 bg-slate-900"
                                    />
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <span className="text-sm text-white">Modo Seguro</span>
                                        <span className="text-xs text-slate-500 block">Pausa automática de 5min a cada 20 mensagens</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Progress Card */}
                        {campaign.status !== 'idle' && (
                            <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-sm overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-white font-medium">
                                            {campaign.status === 'running' && '🚀 Enviando...'}
                                            {campaign.status === 'paused' && '⏸️ Pausado'}
                                            {campaign.status === 'completed' && '✅ Concluído!'}
                                        </span>
                                        {campaign.currentLead && (
                                            <span className="text-sm text-slate-400">
                                                → {campaign.currentLead}
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 text-emerald-400">
                                                <CheckCircle className="w-4 h-4" />
                                                {campaign.sent}
                                            </span>
                                            <span className="flex items-center gap-1 text-red-400">
                                                <XCircle className="w-4 h-4" />
                                                {campaign.failed}
                                            </span>
                                            <span className="text-slate-500">
                                                de {campaign.total}
                                            </span>
                                        </div>
                                        {countdown > 0 && campaign.status === 'running' && (
                                            <span className="text-violet-300">
                                                Próximo em {countdown}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {campaign.status === 'idle' ? (
                                <button
                                    onClick={startCampaign}
                                    disabled={!isConnected || selectedLeads.size === 0 || !message.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
                                >
                                    <Send className="w-5 h-5" />
                                    Iniciar Disparo
                                    <span className="ml-1 px-2 py-0.5 rounded-lg bg-white/20 text-sm">
                                        {selectedLeads.size} leads
                                    </span>
                                </button>
                            ) : campaign.status === 'completed' ? (
                                <button
                                    onClick={cancelCampaign}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-all"
                                >
                                    Novo Disparo
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={togglePause}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all ${campaign.status === 'paused'
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                                                : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                                            }`}
                                    >
                                        {campaign.status === 'paused' ? (
                                            <>
                                                <Play className="w-5 h-5" />
                                                Continuar
                                            </>
                                        ) : (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                Pausar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={cancelCampaign}
                                        className="px-6 py-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
                                    >
                                        <X className="w-5 h-5" />
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
