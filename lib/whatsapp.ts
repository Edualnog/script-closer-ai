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
        const sock = this.sockets.get(userId)
        if (!sock || !sock.user) {
            throw new Error('WhatsApp not connected')
        }

        // Format phone number for WhatsApp (remove non-digits, add @s.whatsapp.net)
        let phone = to.replace(/\D/g, '')
        if (!phone.startsWith('55')) {
            phone = '55' + phone
        }
        const jid = phone + '@s.whatsapp.net'

        try {
            await sock.sendMessage(jid, { text: message })
            return true
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }

    isConnected(userId: string): boolean {
        const state = this.states.get(userId)
        return state?.status === 'connected'
    }
}

// Singleton instance
export const whatsappManager = new WhatsAppManager()
