'use client'

import { useState, useEffect, useCallback } from 'react'
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
    nextSendIn?: number
}

export default function BulkMessaging() {
    // State
    const [leads, setLeads] = useState<Lead[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>('')
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
    const [message, setMessage] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = useState<string[]>(['novo', 'em_conversa'])

    // Delay config
    const [minDelay, setMinDelay] = useState(45)
    const [maxDelay, setMaxDelay] = useState(90)
    const [safeMode, setSafeMode] = useState(true)

    // Campaign state
    const [campaign, setCampaign] = useState<CampaignStatus>({
        status: 'idle',
        total: 0,
        sent: 0,
        failed: 0
    })
    const [countdown, setCountdown] = useState(0)

    // WhatsApp hook
    const { isConnected, checkConnection, sendMessage } = useWhatsApp()

    // Fetch leads and products
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
                // Ensure data is an array
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
                // Ensure data is an array
                setProducts(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        }
    }

    // Filter leads
    const filteredLeads = leads.filter(lead =>
        statusFilter.includes(lead.status) && lead.contato
    )

    // Toggle lead selection
    const toggleLead = (leadId: string) => {
        const newSelected = new Set(selectedLeads)
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId)
        } else {
            newSelected.add(leadId)
        }
        setSelectedLeads(newSelected)
    }

    // Select all filtered leads
    const selectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set())
        } else {
            setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
        }
    }

    // Generate message with AI
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

    // Start campaign
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

        // Get selected leads
        const leadsToSend = leads.filter(l => selectedLeads.has(l.id))

        for (let i = 0; i < leadsToSend.length; i++) {
            const lead = leadsToSend[i]

            // Check if paused
            if (campaign.status === 'paused') {
                break
            }

            setCampaign(prev => ({
                ...prev,
                currentLead: lead.nome
            }))

            try {
                // Personalize message
                const personalizedMessage = message.replace(/{nome}/gi, lead.nome)

                // Send message
                const success = await sendMessage(lead.contato, personalizedMessage)

                if (success) {
                    setCampaign(prev => ({
                        ...prev,
                        sent: prev.sent + 1
                    }))

                    // Save to conversation history
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

            // Wait before next send (if not last)
            if (i < leadsToSend.length - 1) {
                const delay = Math.floor(
                    Math.random() * (maxDelay - minDelay + 1) + minDelay
                ) * 1000

                // Safe mode: extra pause every 20 messages
                const extraPause = safeMode && (i + 1) % 20 === 0 ? 300000 : 0 // 5 minutes

                const totalDelay = delay + extraPause

                // Countdown
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

    // Pause/Resume campaign
    const togglePause = () => {
        setCampaign(prev => ({
            ...prev,
            status: prev.status === 'running' ? 'paused' : 'running'
        }))
    }

    // Cancel campaign
    const cancelCampaign = () => {
        setCampaign({
            status: 'idle',
            total: 0,
            sent: 0,
            failed: 0
        })
        setCountdown(0)
    }

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        if (statusFilter.includes(status)) {
            setStatusFilter(statusFilter.filter(s => s !== status))
        } else {
            setStatusFilter([...statusFilter, status])
        }
    }

    const statusColors: Record<string, string> = {
        novo: 'bg-green-500',
        em_conversa: 'bg-yellow-500',
        convertido: 'bg-blue-500',
        perdido: 'bg-red-500'
    }

    const statusLabels: Record<string, string> = {
        novo: 'Novo',
        em_conversa: 'Em Conversa',
        convertido: 'Convertido',
        perdido: 'Perdido'
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Send className="w-6 h-6 text-green-500" />
                        Disparos em Massa
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Envie mensagens personalizadas para múltiplos leads
                    </p>
                </div>

                {!isConnected && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        WhatsApp não conectado
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Lead Selection */}
                <div className="space-y-4">
                    {/* Product Selection */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Package className="w-4 h-4" />
                            Produto/Serviço
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="">Selecione um produto</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                            <Filter className="w-4 h-4" />
                            Filtrar por Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleStatusFilter(key)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusFilter.includes(key)
                                        ? `${statusColors[key]} text-white`
                                        : 'bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lead List */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Users className="w-4 h-4" />
                                Leads ({selectedLeads.size} de {filteredLeads.length})
                            </label>
                            <button
                                onClick={selectAll}
                                className="text-sm text-green-500 hover:text-green-400"
                            >
                                {selectedLeads.size === filteredLeads.length ? 'Desmarcar todos' : 'Selecionar todos'}
                            </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredLeads.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Nenhum lead encontrado com os filtros selecionados
                                </p>
                            ) : (
                                filteredLeads.map(lead => (
                                    <label
                                        key={lead.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedLeads.has(lead.id)
                                            ? 'bg-green-500/20 border border-green-500/50'
                                            : 'bg-[#2a2a2a] border border-transparent hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.has(lead.id)}
                                            onChange={() => toggleLead(lead.id)}
                                            className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {lead.nome}
                                            </p>
                                            <p className="text-gray-500 text-xs truncate">
                                                {lead.contato}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[lead.status]} text-white`}>
                                            {statusLabels[lead.status]}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Message & Config */}
                <div className="space-y-4">
                    {/* Message */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <MessageSquare className="w-4 h-4" />
                                Mensagem
                            </label>
                            <button
                                onClick={generateMessage}
                                disabled={isGenerating || !selectedProduct}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
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
                            placeholder="Digite sua mensagem... Use {nome} para personalizar com o nome do lead"
                            rows={5}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Use <code className="bg-gray-800 px-1 rounded">{'{nome}'}</code> para inserir o nome do lead automaticamente
                        </p>
                    </div>

                    {/* Delay Config */}
                    <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                            <Clock className="w-4 h-4" />
                            Intervalo entre envios
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Mínimo (seg)</label>
                                <input
                                    type="number"
                                    value={minDelay}
                                    onChange={(e) => setMinDelay(Number(e.target.value))}
                                    min={30}
                                    max={300}
                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Máximo (seg)</label>
                                <input
                                    type="number"
                                    value={maxDelay}
                                    onChange={(e) => setMaxDelay(Number(e.target.value))}
                                    min={30}
                                    max={300}
                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 mt-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={safeMode}
                                onChange={(e) => setSafeMode(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500"
                            />
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-300">
                                Modo seguro (pausa 5min a cada 20 msgs)
                            </span>
                        </label>
                    </div>

                    {/* Campaign Progress */}
                    {campaign.status !== 'idle' && (
                        <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-300">
                                    {campaign.status === 'running' && '🚀 Disparando...'}
                                    {campaign.status === 'paused' && '⏸️ Pausado'}
                                    {campaign.status === 'completed' && '✅ Concluído'}
                                </span>
                                {campaign.currentLead && (
                                    <span className="text-xs text-gray-500">
                                        Enviando para: {campaign.currentLead}
                                    </span>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                                <div
                                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(campaign.sent / campaign.total) * 100}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 text-green-400">
                                        <CheckCircle className="w-4 h-4" />
                                        {campaign.sent}
                                    </span>
                                    <span className="flex items-center gap-1 text-red-400">
                                        <XCircle className="w-4 h-4" />
                                        {campaign.failed}
                                    </span>
                                    <span className="text-gray-500">
                                        de {campaign.total}
                                    </span>
                                </div>
                                {countdown > 0 && campaign.status === 'running' && (
                                    <span className="text-gray-400">
                                        ⏳ Próximo em: {countdown}s
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {campaign.status === 'idle' ? (
                            <button
                                onClick={startCampaign}
                                disabled={!isConnected || selectedLeads.size === 0 || !message.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
                            >
                                <Send className="w-5 h-5" />
                                Iniciar Disparo ({selectedLeads.size} leads)
                            </button>
                        ) : campaign.status === 'completed' ? (
                            <button
                                onClick={cancelCampaign}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
                            >
                                Novo Disparo
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={togglePause}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-colors ${campaign.status === 'paused'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-yellow-600 hover:bg-yellow-700'
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
                                    className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
