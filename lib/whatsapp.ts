import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    ConnectionState
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import QRCode from 'qrcode'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'

export interface WhatsAppState {
    status: 'disconnected' | 'connecting' | 'qr' | 'connected'
    qrCode?: string
    phoneNumber?: string
}

class WhatsAppManager extends EventEmitter {
    private sockets: Map<string, WASocket> = new Map()
    private states: Map<string, WhatsAppState> = new Map()
    private authDir = path.join(process.cwd(), '.whatsapp-sessions')

    constructor() {
        super()
        // Ensure sessions directory exists
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true })
        }
    }

    getState(userId: string): WhatsAppState {
        return this.states.get(userId) || { status: 'disconnected' }
    }

    async connect(userId: string): Promise<void> {
        if (this.sockets.has(userId)) {
            const existing = this.sockets.get(userId)
            if (existing?.user) {
                return // Already connected
            }
        }

        const sessionPath = path.join(this.authDir, userId)
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

        this.states.set(userId, { status: 'connecting' })
        this.emit('state', userId, this.states.get(userId))

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['ScriptCloser', 'Chrome', '1.0.0']
        })

        this.sockets.set(userId, sock)

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
            const { connection, lastDisconnect, qr } = update

            if (qr) {
                // Generate QR code as base64 image
                const qrImage = await QRCode.toDataURL(qr)
                this.states.set(userId, { status: 'qr', qrCode: qrImage })
                this.emit('state', userId, this.states.get(userId))
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

                this.states.set(userId, { status: 'disconnected' })
                this.emit('state', userId, this.states.get(userId))

                if (shouldReconnect) {
                    // Retry connection
                    setTimeout(() => this.connect(userId), 3000)
                } else {
                    // User logged out, clean up session
                    this.sockets.delete(userId)
                    // Optionally delete session files
                    try {
                        fs.rmSync(sessionPath, { recursive: true, force: true })
                    } catch (e) {
                        console.error('Error removing session:', e)
                    }
                }
            } else if (connection === 'open') {
                const phoneNumber = sock.user?.id.split(':')[0] || undefined
                this.states.set(userId, {
                    status: 'connected',
                    phoneNumber
                })
                this.emit('state', userId, this.states.get(userId))
            }
        })
    }

    async disconnect(userId: string): Promise<void> {
        const sock = this.sockets.get(userId)
        if (sock) {
            await sock.logout()
            this.sockets.delete(userId)
            this.states.set(userId, { status: 'disconnected' })
            this.emit('state', userId, this.states.get(userId))
        }
    }

    async sendMessage(userId: string, to: string, message: string): Promise<boolean> {
        console.log('[WhatsApp] sendMessage called for user:', userId)
        console.log('[WhatsApp] To:', to, 'Message:', message)

        const sock = this.sockets.get(userId)
        console.log('[WhatsApp] Socket exists:', !!sock)
        console.log('[WhatsApp] Socket user:', sock?.user?.id)

        if (!sock || !sock.user) {
            console.error('[WhatsApp] No socket or user - not connected')
            throw new Error('WhatsApp not connected')
        }

        // Format phone number for WhatsApp (remove non-digits, add @s.whatsapp.net)
        let phone = to.replace(/\D/g, '')
        console.log('[WhatsApp] Original phone after cleanup:', phone)

        // Add Brazil country code if not present
        // Brazilian numbers: 55 + DDD(2) + 9 + number(8) = 13 digits
        // Or: 55 + DDD(2) + number(8) = 12 digits (landline)
        if (phone.length === 11 && !phone.startsWith('55')) {
            // Format: DDD(2) + 9 + number(8) = 11 digits, add 55
            phone = '55' + phone
        } else if (phone.length === 10 && !phone.startsWith('55')) {
            // Format: DDD(2) + number(8) = 10 digits (old format), add 55 + 9
            phone = '55' + phone.slice(0, 2) + '9' + phone.slice(2)
        } else if (!phone.startsWith('55')) {
            phone = '55' + phone
        }

        const jid = phone + '@s.whatsapp.net'
        console.log('[WhatsApp] Final JID:', jid)

        try {
            const result = await sock.sendMessage(jid, { text: message })
            console.log('[WhatsApp] Send result:', result)
            return true
        } catch (error) {
            console.error('[WhatsApp] Error sending message:', error)
            throw error
        }
    }

    isConnected(userId: string): boolean {
        const state = this.states.get(userId)
        return state?.status === 'connected'
    }
}

// Extend globalThis to include our manager
declare global {
    var __whatsappManager: WhatsAppManager | undefined
}

// Use globalThis to persist across module reloads in development
export const whatsappManager = globalThis.__whatsappManager || new WhatsAppManager()
globalThis.__whatsappManager = whatsappManager
