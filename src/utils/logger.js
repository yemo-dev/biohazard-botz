import fs from 'fs'
import path from 'path'
import Color from './color.js'

const logDir = path.resolve('./logs')
const logFile = path.join(logDir, 'error.log')

/** Ensure logs directory exists **/
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
}

const saveLog = (type, msg) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
    const logMsg = `[${timestamp}] [${type}] ${msg}\n`
    try {
        fs.appendFileSync(logFile, logMsg)
    } catch (err) {
        // Fallback if writing fails
    }
}

const logger = {
    info: (msg) => console.log(`${Color.cyan('[i]')} ${Color.bold(Color.cyan('INFO'))}  ${msg}`),
    ready: (msg) => console.log(`${Color.green('[+]')} ${Color.bold(Color.green('READY'))} ${msg}`),
    warn: (msg) => {
        console.log(`${Color.yellow('[!]')} ${Color.bold(Color.yellow('WARN'))}  ${msg}`)
        saveLog('WARN', msg)
    },
    error: (msg) => {
        console.error(`${Color.red('[x]')} ${Color.bold(Color.red('ERROR'))} ${msg}`)
        saveLog('ERROR', msg)
    },
    chat: (sender, msg, type) => console.log(`${Color.magenta('[-]')} ${Color.bold(Color.magenta('CHAT'))}  [${Color.blue(sender)}] ${Color.gray(type)} » ${msg}`),
}

export default logger
