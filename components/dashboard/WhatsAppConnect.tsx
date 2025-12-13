'use client'

import { useState, useEffect, useCallback } from 'react'
import { Smartphone, QrCode, Loader2, Check, X, LogOut, MessageSquare } from 'lucide-react'

interface WhatsAppState {
    status: 'disconnected' | 'connecting' | 'qr' | 'connected'
    qrCode?: string
    phoneNumber?: string
}

interface WhatsAppConnectProps {
    isOpen: boolean
    onClose: () => void
    onSendMessage?: (to: string, message: string) => Promise<boolean>
}

export function WhatsAppConnect({ isOpen, onClose }: WhatsAppConnectProps) {
    const [state, setState] = useState<WhatsAppState>({ status: 'disconnected' })
    const [loading, setLoading] = useState(false)
    const [polling, setPolling] = useState(false)

    // Fetch current status
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp')
            if (res.ok) {
                const data = await res.json()
                console.log('[WhatsApp] Status:', data)
                setState(data)
                return data.status
            }
        } catch (error) {
            console.error('Error fetching status:', error)
        }
        return null
    }, [])

    // Start connection
    const connect = async () => {
        setLoading(true)
        setPolling(true) // Start polling immediately
        try {
            const res = await fetch('/api/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'connect' })
            })
            if (res.ok) {
                const data = await res.json()
                console.log('[WhatsApp] Connect response:', data)
                setState(data)
            }
        } catch (error) {
            console.error('Error connecting:', error)
            setPolling(false)
        } finally {
            setLoading(false)
        }
    }

    // Disconnect
    const disconnect = async () => {
        setLoading(true)
        setPolling(false)
        try {
            await fetch('/api/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'disconnect' })
            })
            setState({ status: 'disconnected' })
        } catch (error) {
            console.error('Error disconnecting:', error)
        } finally {
            setLoading(false)
        }
    }

    // Poll for status updates - faster polling (1 second)
    useEffect(() => {
        if (!polling || !isOpen) return

        console.log('[WhatsApp] Polling started')

        const interval = setInterval(async () => {
            const status = await fetchStatus()
            console.log('[WhatsApp] Poll result:', status)
            if (status === 'connected') {
                console.log('[WhatsApp] Connected! Stopping poll')
                setPolling(false)
            }
        }, 1000) // Poll every 1 second

        return () => {
            console.log('[WhatsApp] Polling stopped')
            clearInterval(interval)
        }
    }, [polling, isOpen, fetchStatus])

    // Fetch initial status when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchStatus()
        }
    }, [isOpen, fetchStatus])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Conectar WhatsApp</h2>
                                <p className="text-sm text-white/70">
                                    {state.status === 'connected'
                                        ? `Conectado: ${state.phoneNumber}`
                                        : 'Escaneie o QR code'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose}>
                            <X className="w-5 h-5 text-white/70 hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {state.status === 'disconnected' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <QrCode className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-6">
                                Conecte seu WhatsApp para enviar mensagens diretamente da plataforma.
                            </p>
                            <button
                                onClick={connect}
                                disabled={loading}
                                className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Smartphone className="w-4 h-4" />
                                )}
                                Conectar WhatsApp
                            </button>
                        </div>
                    )}

                    {state.status === 'connecting' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Iniciando conexão...</p>
                        </div>
                    )}

                    {state.status === 'qr' && state.qrCode && (
                        <div className="text-center py-4">
                            <div className="bg-white rounded-xl p-4 inline-block shadow-lg border border-gray-100 mb-4">
                                <img
                                    src={state.qrCode}
                                    alt="QR Code"
                                    className="w-48 h-48"
                                />
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                                Escaneie com seu WhatsApp:
                            </p>
                            <ol className="text-xs text-gray-500 text-left max-w-xs mx-auto space-y-1">
                                <li>1. Abra o WhatsApp no celular</li>
                                <li>2. Vá em Configurações → Dispositivos conectados</li>
                                <li>3. Toque em "Conectar dispositivo"</li>
                                <li>4. Escaneie este QR code</li>
                            </ol>
                        </div>
                    )}

                    {state.status === 'connected' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-900 font-medium mb-2">WhatsApp Conectado!</p>
                            <p className="text-gray-500 text-sm mb-6">
                                Número: {state.phoneNumber}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={disconnect}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Desconectar
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Pronto!
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Hook to send messages
export function useWhatsApp() {
    const [isConnected, setIsConnected] = useState(false)

    const checkConnection = useCallback(async () => {
        try {
            console.log('[useWhatsApp] Checking connection...')
            const res = await fetch('/api/whatsapp')
            console.log('[useWhatsApp] Response status:', res.status)
            if (res.ok) {
                const data = await res.json()
                console.log('[useWhatsApp] Response data:', data)
                setIsConnected(data.status === 'connected')
                return data.status === 'connected'
            }
        } catch (error) {
            console.error('[useWhatsApp] Error checking connection:', error)
        }
        return false
    }, [])

    const sendMessage = useCallback(async (to: string, message: string) => {
        try {
            const res = await fetch('/api/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send', to, message })
            })
            if (res.ok) {
                const data = await res.json()
                return data.success
            }
        } catch (error) {
            console.error('Error sending message:', error)
        }
        return false
    }, [])

    return { isConnected, checkConnection, sendMessage }
}
