import fs from 'fs'
import path from 'path'
import Color from './color.js'

const logDir = path.resolve('./logs')
const logFile = path.join(logDir, 'error.log')

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
}

const saveLog = (type, msg) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
    try {
        fs.appendFileSync(logFile, `[${timestamp}] [${type}] ${msg}\n`)
    } catch { }
}

const logger = {
    info: (msg) => console.log(`${Color.cyan('[i]')} ${Color.bold(Color.cyan('INFO'))}  ${msg}`),
    ready: (msg) => console.log(`${Color.green('[+]')} ${Color.bold(Color.green('READY'))} ${msg}`),
    warn: (msg) => { console.log(`${Color.yellow('[!]')} ${Color.bold(Color.yellow('WARN'))}  ${msg}`); saveLog('WARN', msg) },
    error: (msg) => { console.error(`${Color.red('[x]')} ${Color.bold(Color.red('ERROR'))} ${msg}`); saveLog('ERROR', msg) },
    chat: (sender, msg, type) => console.log(`${Color.magenta('[-]')} ${Color.bold(Color.magenta('CHAT'))}  [${Color.blue(sender)}] ${Color.gray(type)} » ${msg}`),
}

export default logger

const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

const humanDuration = (ms) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h) return `${h}h ${m % 60}m ${s % 60}s`
    if (m) return `${m}m ${s % 60}s`
    return `${s}s`
}

const ucFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const truncate = (str, max = 100) => str?.length > max ? str.slice(0, max) + '...' : str

const randomOf = (...items) => items[Math.floor(Math.random() * items.length)]

export { formatBytes, humanDuration, ucFirst, truncate, randomOf }
