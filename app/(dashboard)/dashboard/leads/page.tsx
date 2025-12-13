'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Phone, MessageSquare, CheckCircle, XCircle, Clock, Plus, Trash2, X, Upload, Download, Send } from 'lucide-react'

interface Lead {
    id: string
    nome: string
    contato: string
    status: 'novo' | 'em_conversa' | 'convertido' | 'perdido'
    notas: string
    created_at: string
    updated_at: string
    products?: { nome: string }
    scripts?: { mensagem_abertura: string }
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [importText, setImportText] = useState('')
    const [newLead, setNewLead] = useState({ nome: '', contato: '', notas: '' })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const statusConfig = {
        novo: { label: 'Novo', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        em_conversa: { label: 'Em conversa', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
        convertido: { label: 'Convertido', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        perdido: { label: 'Perdido', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads')
            if (res.ok) {
                const data = await res.json()
                setLeads(data.leads)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const addLead = async () => {
        if (!newLead.nome.trim()) return

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            })
            if (res.ok) {
                setShowAddModal(false)
                setNewLead({ nome: '', contato: '', notas: '' })
                fetchLeads()
            }
        } catch (error) {
            console.error('Error adding lead:', error)
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch('/api/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            fetchLeads()
        } catch (error) {
            console.error('Error updating lead:', error)
        }
    }

    const deleteLead = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return

        try {
            await fetch(`/api/leads?id=${id}`, { method: 'DELETE' })
            fetchLeads()
        } catch (error) {
            console.error('Error deleting lead:', error)
        }
    }

    // Export leads as CSV
    const exportLeads = () => {
        const csvContent = [
            ['Nome', 'Contato', 'Status', 'Notas', 'Data Criação'].join(','),
            ...leads.map(lead => [
                `"${lead.nome}"`,
                `"${lead.contato || ''}"`,
                lead.status,
                `"${(lead.notas || '').replace(/"/g, '""')}"`,
                new Date(lead.created_at).toLocaleDateString('pt-BR')
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    // Import leads from text (one per line: nome, contato)
    const importLeads = async () => {
        const lines = importText.trim().split('\n').filter(line => line.trim())

        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim())
            const nome = parts[0]
            const contato = parts[1] || ''

            if (nome) {
                await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, contato, notas: '' })
                })
            }
        }

        setShowImportModal(false)
        setImportText('')
        fetchLeads()
    }

    // Handle CSV file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            // Skip header line if it looks like a header
            const lines = text.split('\n')
            const dataLines = lines[0].toLowerCase().includes('nome') ? lines.slice(1) : lines
            setImportText(dataLines.join('\n'))
        }
        reader.readAsText(file)
    }

    // Open WhatsApp with lead contact (auto-add Brazil code)
    const openWhatsApp = (lead: Lead) => {
        if (!lead.contato) {
            alert('Este lead não tem contato cadastrado')
            return
        }

        // Clean phone number (remove non-digits)
        let phone = lead.contato.replace(/\D/g, '')

        // Add Brazil country code if not present
        if (!phone.startsWith('55')) {
            phone = '55' + phone
        }

        const url = `https://wa.me/${phone}`
        window.open(url, '_blank')
    }

    const stats = {
        total: leads.length,
        novos: leads.filter(l => l.status === 'novo').length,
        emConversa: leads.filter(l => l.status === 'em_conversa').length,
        convertidos: leads.filter(l => l.status === 'convertido').length,
        perdidos: leads.filter(l => l.status === 'perdido').length
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-48" />
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Histórico de Leads</h1>
                        <p className="text-sm text-gray-500 mt-1">Gerencie seus leads e acompanhe conversões</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Import Button */}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Importar
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={exportLeads}
                            disabled={leads.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>

                        {/* Add Lead Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Lead
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className={`text-2xl font-bold ${config.color}`}>
                                {stats[key === 'em_conversa' ? 'emConversa' : key === 'novo' ? 'novos' : key === 'convertido' ? 'convertidos' : 'perdidos'] as number}
                            </p>
                            <p className="text-xs text-gray-500">{config.label}</p>
                        </div>
                    ))}
                </div>

                {/* Leads Table */}
                {leads.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum lead cadastrado ainda</p>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-sm text-gray-900 font-medium hover:underline"
                            >
                                Adicionar primeiro lead
                            </button>
                            <span className="text-gray-300">ou</span>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="text-sm text-gray-900 font-medium hover:underline"
                            >
                                Importar leads
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Lead</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Contato</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Notas</th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leads.map(lead => {
                                    const config = statusConfig[lead.status] || statusConfig.novo
                                    return (
                                        <tr key={lead.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{lead.nome}</p>
                                                {lead.products?.nome && (
                                                    <p className="text-xs text-gray-500">{lead.products.nome}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{lead.contato || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                    className={`text-xs font-medium rounded-full px-3 py-1 ${config.bg} ${config.color} border-none cursor-pointer`}
                                                >
                                                    <option value="novo">Novo</option>
                                                    <option value="em_conversa">Em conversa</option>
                                                    <option value="convertido">Convertido</option>
                                                    <option value="perdido">Perdido</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                                    {lead.notas || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* WhatsApp Button */}
                                                    <button
                                                        onClick={() => openWhatsApp(lead)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                                                        title="Enviar mensagem no WhatsApp"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        WhatsApp
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Excluir lead"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Lead Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Adicionar Lead</h2>
                                <button onClick={() => setShowAddModal(false)}>
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={newLead.nome}
                                        onChange={(e) => setNewLead({ ...newLead, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="Nome do lead"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contato (WhatsApp)</label>
                                    <input
                                        type="text"
                                        value={newLead.contato}
                                        onChange={(e) => setNewLead({ ...newLead, contato: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="5511999999999"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Formato: código do país + DDD + número</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                    <textarea
                                        value={newLead.notas}
                                        onChange={(e) => setNewLead({ ...newLead, notas: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                        rows={3}
                                        placeholder="Observações sobre o lead..."
                                    />
                                </div>
                                <button
                                    onClick={addLead}
                                    disabled={!newLead.nome.trim()}
                                    className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold">Importar Leads</h2>
                                    <p className="text-sm text-gray-500">Cole seus leads ou importe um arquivo CSV</p>
                                </div>
                                <button onClick={() => setShowImportModal(false)}>
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* File Upload */}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Clique para escolher arquivo CSV
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-2 text-gray-400">ou cole manualmente</span>
                                    </div>
                                </div>

                                {/* Manual Input */}
                                <div>
                                    <textarea
                                        value={importText}
                                        onChange={(e) => setImportText(e.target.value)}
                                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono text-sm"
                                        rows={6}
                                        placeholder="João Silva, 5511999999999&#10;Maria Santos, 5521888888888&#10;Pedro Costa, 5531777777777"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Formato: Nome, Contato (um por linha)</p>
                                </div>

                                <button
                                    onClick={importLeads}
                                    disabled={!importText.trim()}
                                    className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Importar Leads
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
