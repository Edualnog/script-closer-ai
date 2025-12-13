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

export interface IncomingMessage {
    userId: string
    from: string
    text: string
    timestamp: string
    messageId: string
}

// Callback type for message handler
export type MessageCallback = (message: IncomingMessage) => Promise<void>

// Store pending messages for leads not yet matched
const pendingMessages: Map<string, IncomingMessage[]> = new Map()

class WhatsAppManager extends EventEmitter {
    private sockets: Map<string, WASocket> = new Map()
    private states: Map<string, WhatsAppState> = new Map()
    private authDir = path.join(process.cwd(), '.whatsapp-sessions')
    private messageCallback: MessageCallback | null = null

    constructor() {
        super()
        // Ensure sessions directory exists
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true })
        }
    }

    // Register callback for incoming messages
    onMessage(callback: MessageCallback) {
        this.messageCallback = callback
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

        // Listen for incoming messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return // Only process new messages

            for (const msg of messages) {
                // Skip our own messages
                if (msg.key.fromMe) continue

                // Skip if no message content
                if (!msg.message) continue

                // Get sender phone number (remove @s.whatsapp.net)
                const senderJid = msg.key.remoteJid || ''
                const senderPhone = senderJid.replace('@s.whatsapp.net', '')

                // Extract message text
                let text = ''
                if (msg.message.conversation) {
                    text = msg.message.conversation
                } else if (msg.message.extendedTextMessage?.text) {
                    text = msg.message.extendedTextMessage.text
                } else if (msg.message.imageMessage?.caption) {
                    text = '[Imagem] ' + (msg.message.imageMessage.caption || '')
                } else if (msg.message.videoMessage?.caption) {
                    text = '[Vídeo] ' + (msg.message.videoMessage.caption || '')
                } else if (msg.message.documentMessage?.fileName) {
                    text = '[Documento] ' + msg.message.documentMessage.fileName
                } else if (msg.message.audioMessage) {
                    text = '[Áudio]'
                } else {
                    text = '[Mídia]'
                }

                console.log('[WhatsApp] Received message from:', senderPhone, 'Text:', text)

                // Create message object
                const incomingMessage: IncomingMessage = {
                    userId,
                    from: senderPhone,
                    text: text,
                    timestamp: new Date(msg.messageTimestamp as number * 1000).toISOString(),
                    messageId: msg.key.id || ''
                }

                // Call registered callback if exists
                if (this.messageCallback) {
                    try {
                        await this.messageCallback(incomingMessage)
                    } catch (error) {
                        console.error('[WhatsApp] Error in message callback:', error)
                    }
                }

                // Also emit event for other listeners
                this.emit('message', userId, incomingMessage)
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

    // Get all contacts from WhatsApp
    // Note: Baileys doesn't provide a direct way to list all contacts
    // This returns contacts from our internal tracking
    async getContacts(userId: string): Promise<Array<{ phone: string, name: string }>> {
        const sock = this.sockets.get(userId)
        if (!sock || !sock.user) {
            throw new Error('WhatsApp not connected')
        }

        // We can't directly list contacts, but we can check if specific numbers exist
        // For now, return an empty array - contacts will be created from incoming messages
        console.log('[WhatsApp] getContacts called - contacts are created automatically from messages')
        return []
    }

    // Check if a phone number exists on WhatsApp
    async checkNumber(userId: string, phone: string): Promise<{ exists: boolean, jid?: string }> {
        const sock = this.sockets.get(userId)
        if (!sock || !sock.user) {
            throw new Error('WhatsApp not connected')
        }

        try {
            // Format phone number
            let formattedPhone = phone.replace(/\D/g, '')
            if (!formattedPhone.startsWith('55')) {
                formattedPhone = '55' + formattedPhone
            }

            const result = await sock.onWhatsApp(formattedPhone)
            if (result && result.length > 0) {
                return { exists: true, jid: result[0].jid }
            }
            return { exists: false }
        } catch (error) {
            console.error('[WhatsApp] Error checking number:', error)
            return { exists: false }
        }
    }

    // Get profile picture URL for a contact
    async getProfilePicture(userId: string, phone: string): Promise<string | null> {
        const sock = this.sockets.get(userId)
        if (!sock || !sock.user) {
            throw new Error('WhatsApp not connected')
        }

        try {
            let formattedPhone = phone.replace(/\D/g, '')
            if (!formattedPhone.startsWith('55')) {
                formattedPhone = '55' + formattedPhone
            }
            const jid = formattedPhone + '@s.whatsapp.net'

            const url = await sock.profilePictureUrl(jid, 'preview')
            return url || null
        } catch (error) {
            // No profile picture or error
            return null
        }
    }

    // Get recent chats - simplified version
    // Chats will be populated from incoming messages automatically
    async getRecentChats(userId: string, limit: number = 20): Promise<Array<{
        phone: string,
        name: string,
        messages: Array<{ type: 'you' | 'lead', content: string, timestamp: string }>
    }>> {
        console.log('[WhatsApp] getRecentChats called - chats are created automatically from messages')
        // Return empty - chats are created from incoming messages
        return []
    }
}

// Extend globalThis to include our manager
declare global {
    var __whatsappManager: WhatsAppManager | undefined
}

// Check if existing manager has onMessage method, if not recreate
let manager = globalThis.__whatsappManager
if (!manager || typeof manager.onMessage !== 'function') {
    console.log('[WhatsApp] Creating new WhatsAppManager instance')
    manager = new WhatsAppManager()
    globalThis.__whatsappManager = manager
}

// Use globalThis to persist across module reloads in development
export const whatsappManager = manager

// Register message callback to save incoming messages (only if not already registered)
if (typeof whatsappManager.onMessage === 'function') {
    whatsappManager.onMessage(async (message) => {
        console.log('[WhatsApp Callback] Incoming message, calling API to save...')
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            const response = await fetch(`${baseUrl}/api/whatsapp/incoming`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            })

            if (response.ok) {
                const result = await response.json()
                console.log('[WhatsApp Callback] Message saved:', result.success ? result.leadName : 'Lead not found')
            } else {
                console.error('[WhatsApp Callback] API error:', response.status)
            }
        } catch (error) {
            console.error('[WhatsApp Callback] Error calling API:', error)
        }
    })
}
