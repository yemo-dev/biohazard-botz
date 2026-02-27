/** Minimum Node.js Requirement Check **/
if (parseInt(process.versions.node.split('.')[0]) < 20) {
    console.log('\x1b[31m[!] ERROR: Node.js v20 or higher is required.\x1b[0m')
    console.log(`[!] Current version: v${process.versions.node}`)
    process.exit(1)
}

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from 'baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import readline from 'readline'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'
import logger from './src/utils/logger.js'
import config from './src/config.js'
import { handleMessage, loadPlugins } from './src/handler.js'
import { checkLogin } from './src/auth.js'

/** Simple readline interface for interactive pairing code request **/
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const msgRetryCounterCache = new NodeCache()
/** Group metadata cache — 5 min TTL to prevent WA rate limiting **/
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

async function connectToWhatsApp() {
    /** Clear terminal across all OS (Windows, Linux, macOS) **/
    console.clear()

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName)

    /** Auto Session Cleanup every 30 mins **/
    setInterval(() => {
        try {
            const sessionDir = path.resolve(`./${config.sessionName}`)
            if (fs.existsSync(sessionDir)) {
                const files = fs.readdirSync(sessionDir)
                let deletedFiles = 0
                for (const file of files) {
                    if (file !== 'creds.json') {
                        fs.unlinkSync(path.join(sessionDir, file))
                        deletedFiles++
                    }
                }
                if (deletedFiles > 0) {
                    logger.info(`Session Cleanup: Deleted ${deletedFiles} old state files.`)
                }
            }
        } catch (err) {
            logger.error(`Session Cleanup Error: ${err.message}`)
        }
    }, 30 * 60 * 1000)

    const version = [2, 3000, 1034074495]
    logger.info(`using WA v${version.join('.')}`)

    const socketConfig = {
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        browser: Browsers.macOS("Chrome"),
        getMessage: async (key) => {
            return {
                conversation: 'Hello'
            }
        },
        cachedGroupMetadata: async (jid) => groupCache.get(jid)
    }

    const sock = makeWASocket(socketConfig)

    /** Attach cache to sock so handler can access it **/
    sock._groupCache = groupCache

    if (!sock.authState.creds.registered) {
        console.log('Please enter your WhatsApp phone number (e.g., 628xxxxxx): ')
        let phoneNumber = await question('')
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        /** Delay is required before requesting pairing code per docs **/
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber)
                logger.ready(`Pairing code: ${code?.match(/.{1,4}/g)?.join('-') || code}`)
            } catch (err) {
                logger.error(`Failed to request pairing code: ${err.message}`)
            }
        }, 3000)
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const statusCode = (lastDisconnect.error && lastDisconnect.error.output) ? lastDisconnect.error.output.statusCode : lastDisconnect.error?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== DisconnectReason.forbidden
            const isConflict = statusCode === 409 || lastDisconnect.error?.message?.includes('conflict')

            const errMessage = lastDisconnect.error?.message || lastDisconnect.error || 'Unknown error'
            logger.warn(`Connection closed due to: ${errMessage}, reconnecting: ${shouldReconnect}`)

            if (lastDisconnect.error) {
            }

            if (shouldReconnect) {
                const delay = isConflict ? 5000 : 3000
                if (isConflict) logger.info('Conflict detected! Waiting 5 seconds before reconnecting to clear old session...')
                setTimeout(connectToWhatsApp, delay)
            } else {
                /** Automatically delete session if logged out per User Rules **/
                logger.warn('Device logged out. Automatically deleting stored session...')
                try {
                    const sessionDir = path.resolve(`./${config.sessionName}`)
                    if (fs.existsSync(sessionDir)) {
                        fs.rmSync(sessionDir, { recursive: true, force: true })
                        logger.info('Session successfully deleted! Restarting bot to request new pairing code...')
                    }
                } catch (err) {
                    logger.error(`Failed to delete session: ${err.message}`)
                }
                setTimeout(connectToWhatsApp, 3000)
            }
        } else if (connection === 'open') {
            logger.ready('Connected to WhatsApp via yebails socket!')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        await handleMessage(sock, m)
    })
}

/** Catch uncaught exceptions to prevent crashing **/
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}\nStack: ${err.stack}`)
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`)
})

async function start() {
    /** Terminal Authentication System **/
    const authorized = await checkLogin(question)
    if (authorized) {
        await loadPlugins()
        await connectToWhatsApp()
    }
}

start()
