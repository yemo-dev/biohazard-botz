import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { performance } from 'perf_hooks'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
    name: "ping",
    aliases: ["p", "info", "status"],
    description: "Check bot response time and system info",
    ownerOnly: false,
    execute: async ({ sock, msg }) => {
        const start = performance.now()

        /** Read main project package.json to find what Baileys fork is installed **/
        const mainPkgPath = path.join(__dirname, '../package.json')
        const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'))
        const baileysSource = mainPkg.dependencies.baileys || 'Unknown'

        const formatSize = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB'
        const formatSizeGb = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'

        const memoryUsage = process.memoryUsage()
        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const cpus = os.cpus()

        const uptimeSeconds = Math.floor(process.uptime())
        const hours = Math.floor(uptimeSeconds / 3600)
        const minutes = Math.floor((uptimeSeconds % 3600) / 60)
        const seconds = uptimeSeconds % 60
        const uptime = `${hours}h ${minutes}m ${seconds}s`

        const end = performance.now()
        const latency = (end - start).toFixed(4)

        let text = `B I O H A Z A R D - B O T Z\n\n`
        text += `- Latency: ${latency} ms\n`
        text += `- OS: ${os.type()} ${os.release()} (${os.arch()})\n`
        text += `- CPU: ${cpus[0].model} (${cpus.length} Cores)\n`
        text += `- RAM: ${formatSizeGb(totalMem - freeMem)} / ${formatSizeGb(totalMem)}\n`
        text += `- NodeJS: ${process.version}\n`
        text += `- Baileys: ${baileysSource}\n`
        text += `- Uptime: ${uptime}\n`

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
    }
}
