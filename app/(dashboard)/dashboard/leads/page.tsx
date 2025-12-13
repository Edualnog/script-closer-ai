'use client'

import { useState, useEffect } from 'react'
import { User, Phone, MessageSquare, CheckCircle, XCircle, Clock, Plus, Trash2, Edit2, X } from 'lucide-react'

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
    const [newLead, setNewLead] = useState({ nome: '', contato: '', notas: '' })

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
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Lead
                    </button>
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
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 text-sm text-gray-900 font-medium hover:underline"
                        >
                            Adicionar primeiro lead
                        </button>
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
                                    const Icon = config.icon
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
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                                    <input
                                        type="text"
                                        value={newLead.contato}
                                        onChange={(e) => setNewLead({ ...newLead, contato: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="WhatsApp, email..."
                                    />
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
                                    className="w-full py-2 bg-gray-900 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
