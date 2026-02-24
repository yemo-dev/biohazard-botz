import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'
import config from './config.js'
import logger from './utils/logger.js'

const messageIdCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, '../plugins')

/** Load plugins dynamically **/
const plugins = new Map()

const loadPlugins = async () => {
    try {
        if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir)

        const getFiles = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            const files = entries
                .filter(file => !file.isDirectory() && file.name.endsWith('.js'))
                .map(file => path.join(dir, file.name))
            const folders = entries.filter(file => file.isDirectory())
            for (const folder of folders) {
                files.push(...getFiles(path.join(dir, folder.name)))
            }
            return files
        }

        const files = getFiles(pluginsDir)

        for (const file of files) {
            const pluginPath = `file://${file}`
            const module = await import(pluginPath)

            if (module.default && module.default.name) {
                plugins.set(module.default.name, module.default)
            }
        }
        logger.info(`Loaded ${plugins.size} plugins`)
    } catch (err) {
        logger.error(`Failed to load plugins: ${err.message}`)
    }
}

/** Initial load **/
loadPlugins()

/** Main message handler **/
export const handleMessage = async (sock, m) => {
    try {
        if (!m.messages || !m.messages[0]) return
        const msg = m.messages[0]
        if (!msg.key.id) return

        /** Ignore broadcast/status messages and non-realtime logs (like history cache) **/
        if (msg.key.remoteJid === 'status@broadcast' || m.type !== 'notify') return

        /** Deduplicate messages to prevent double processing/logging **/
        if (messageIdCache.has(msg.key.id)) return
        messageIdCache.set(msg.key.id, true)

        /** Extract message text **/
        const type = Object.keys(msg.message || {})[0]
        if (!type) return

        let body = ''
        let mimetype = ''

        if (type === 'conversation') {
            body = msg.message.conversation
        } else if (type === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage.text
        } else if (type === 'imageMessage') {
            body = msg.message.imageMessage.caption || ''
            mimetype = msg.message.imageMessage.mimetype
        } else if (type === 'videoMessage') {
            body = msg.message.videoMessage.caption || ''
            mimetype = msg.message.videoMessage.mimetype
        } else if (type === 'audioMessage') {
            mimetype = msg.message.audioMessage.mimetype
        } else if (type === 'documentMessage') {
            mimetype = msg.message.documentMessage.mimetype
        } else if (type === 'stickerMessage') {
            mimetype = msg.message.stickerMessage.mimetype
        }

        /** Extract Sender and Group Info **/
        const isGroup = msg.key.remoteJid.endsWith('@g.us')
        const sender = isGroup ? msg.key.participant : msg.key.remoteJid
        const pushName = msg.pushName || 'User'

        /** Check for quoted messages **/
        const isQuoted = type === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null
        let quotedMsg = null
        let quotedType = null
        let quotedMimetype = ''

        if (isQuoted) {
            quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage
            if (quotedMsg) {
                quotedType = Object.keys(quotedMsg)[0]
                if (quotedType === 'imageMessage') quotedMimetype = quotedMsg.imageMessage.mimetype
                else if (quotedType === 'videoMessage') quotedMimetype = quotedMsg.videoMessage.mimetype
                else if (quotedType === 'audioMessage') quotedMimetype = quotedMsg.audioMessage.mimetype
                else if (quotedType === 'documentMessage') quotedMimetype = quotedMsg.documentMessage.mimetype
                else if (quotedType === 'stickerMessage') quotedMimetype = quotedMsg.stickerMessage.mimetype
            }
        }

        if (!body) return

        /** Check for prefixes **/
        const prefix = config.prefixes.find(p => body.startsWith(p))
        if (!prefix) {
            /** Log normal chat (non-command) if enabled **/
            if (config.logChats) {
                logger.chat(pushName || sender.split('@')[0], body, type)
            }
            return
        }

        /** Log command execution with parsed args **/
        logger.chat(pushName || sender.split('@')[0], body, `${type} | Command`)

        /** Extract command and arguments **/
        const args = body.slice(prefix.length).trim().split(/ +/)
        const cmdName = args.shift().toLowerCase()

        /** Find exactly matching plugin alias/name **/
        let command = null
        for (const plugin of plugins.values()) {
            if (plugin.name === cmdName || (plugin.aliases && plugin.aliases.includes(cmdName))) {
                command = plugin
                break
            }
        }

        if (command) {
            const isOwner = config.ownerNumbers.includes(sender.split('@')[0])

            /** Default to public mode if not set **/
            if (sock.public === undefined) sock.public = true

            /** If in self mode, only allow owner **/
            if (!sock.public && !isOwner) return

            /** If owner-only command, skip if not owner **/
            if (command.ownerOnly && !isOwner) return

            await command.execute({
                sock,
                msg,
                args,
                body,
                config,
                isOwner,
                isGroup,
                sender,
                pushName,
                mimetype,
                isQuoted,
                quotedMsg,
                quotedType,
                quotedMimetype
            })
        }
    } catch (err) {
        logger.error(`Handler Error: ${err.message}`)
    }
}
