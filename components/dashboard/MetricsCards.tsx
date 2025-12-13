'use client'

import { BarChart3, Users, TrendingUp, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

interface MetricsData {
    totalScripts: number
    convertidos: number
    perdidos: number
    emAndamento: number
    taxaConversao: number
    mediaMensagens: number
}

interface MetricsCardProps {
    metrics: MetricsData
}

export function MetricsCards({ metrics }: MetricsCardProps) {
    const cards = [
        {
            title: 'Scripts Criados',
            value: metrics.totalScripts,
            icon: BarChart3,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Taxa de Conversão',
            value: `${metrics.taxaConversao.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Convertidos',
            value: metrics.convertidos,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Em Andamento',
            value: metrics.emAndamento,
            icon: MessageSquare,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        },
        {
            title: 'Perdidos',
            value: metrics.perdidos,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Média de Mensagens',
            value: metrics.mediaMensagens.toFixed(1),
            icon: MessageSquare,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.title}</p>
                </div>
            ))}
        </div>
    )
}
