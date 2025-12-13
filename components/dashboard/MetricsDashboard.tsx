'use client'

import { useEffect, useState } from 'react'
import { MetricsCards } from './MetricsCards'

interface MetricsData {
    totalScripts: number
    convertidos: number
    perdidos: number
    emAndamento: number
    taxaConversao: number
    mediaMensagens: number
}

export function MetricsDashboard() {
    const [metrics, setMetrics] = useState<MetricsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/metrics')
                if (res.ok) {
                    const data = await res.json()
                    setMetrics(data)
                }
            } catch (error) {
                console.error('Error fetching metrics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 mb-2" />
                        <div className="h-8 bg-gray-200 rounded w-16 mb-1" />
                        <div className="h-4 bg-gray-100 rounded w-20" />
                    </div>
                ))}
            </div>
        )
    }

    if (!metrics) return null

    return <MetricsCards metrics={metrics} />
}
