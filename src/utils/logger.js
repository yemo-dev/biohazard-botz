import Color from './color.js'

const logger = {
    info: (msg) => console.log(`${Color.cyan('[i]')} ${Color.bold(Color.cyan('INFO'))}  ${msg}`),
    ready: (msg) => console.log(`${Color.green('[+]')} ${Color.bold(Color.green('READY'))} ${msg}`),
    warn: (msg) => console.log(`${Color.yellow('[!]')} ${Color.bold(Color.yellow('WARN'))}  ${msg}`),
    error: (msg) => console.error(`${Color.red('[x]')} ${Color.bold(Color.red('ERROR'))} ${msg}`),
    chat: (sender, msg, type) => console.log(`${Color.magenta('[-]')} ${Color.bold(Color.magenta('CHAT'))}  [${Color.blue(sender)}] ${Color.gray(type)} » ${msg}`),
}

export default logger
