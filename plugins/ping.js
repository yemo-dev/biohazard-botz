import os from 'os'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

const formatSize = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB'

const getUptime = (uptimeSeconds) => {
    const d = Math.floor(uptimeSeconds / (3600 * 24))
    const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600)
    const m = Math.floor((uptimeSeconds % 3600) / 60)
    const s = Math.floor(uptimeSeconds % 60)
    return `${d}d ${h}h ${m}m ${s}s`
}

const getProgressBar = (percent) => {
    const size = 10
    const progress = Math.round((size * percent) / 100)
    const emptyProgress = size - progress
    const progressText = '■'.repeat(progress)
    const emptyProgressText = '□'.repeat(emptyProgress)
    return `[${progressText}${emptyProgressText}] ${percent.toFixed(1)}%`
}

const getCpuUsage = () => {
    const cpus = os.cpus()
    let totalIdle = 0, totalTick = 0
    cpus.forEach(core => {
        for (const type in core.times) {
            totalTick += core.times[type]
        }
        totalIdle += core.times.idle
    })
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length }
}

const getDiskUsage = () => {
    try {
        if (os.platform() === 'win32') {
            const output = execSync('wmic logicaldisk get size,freespace,caption').toString()
            const lines = output.trim().split('\n').slice(1)
            const line = lines.find(l => l.includes('C:'))
            if (line) {
                const [caption, free, size] = line.trim().split(/\s+/)
                const total = parseInt(size)
                const used = total - parseInt(free)
                return {
                    total: total,
                    used: used,
                    percent: (used / total) * 100
                }
            }
        } else {
            const output = execSync('df -B1 / --output=size,used,avail').toString()
            const [size, used, avail] = output.trim().split('\n')[1].trim().split(/\s+/)
            return {
                total: parseInt(size),
                used: parseInt(used),
                percent: (parseInt(used) / parseInt(size)) * 100
            }
        }
    } catch (e) {
        return { total: 0, used: 0, percent: 0 }
    }
    return { total: 0, used: 0, percent: 0 }
}

export default {
    name: "ping",
    aliases: ["p", "status"],
    description: "Server Status Report",
    execute: async ({ sock, msg }) => {
        const start = getCpuUsage()
        /** Wait for CPU delta **/
        await new Promise(r => setTimeout(r, 100))

        const end = getCpuUsage()
        const idleDelta = end.idle - start.idle
        const totalDelta = end.total - start.total
        const cpuUsage = 100 * (1 - idleDelta / totalDelta)

        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMem = totalMem - freeMem
        const memPercent = (usedMem / totalMem) * 100

        const disk = getDiskUsage()
        const cpus = os.cpus()

        let text = `— *Server Status Report*\n\n`

        text += `*SYSTEM*\n`
        text += `• OS: ${os.type()} ${os.release()}\n`
        text += `• Arch: ${os.arch()} | ${os.version()}\n`
        text += `• Uptime OS: ${getUptime(os.uptime())}\n`
        text += `• Uptime Bot: ${getUptime(process.uptime())}\n\n`

        text += `*CPU*\n`
        text += `• Model: ${cpus[0].model}\n`
        text += `• Cores: ${cpus.length} Cores @ ${cpus[0].speed}MHz\n`
        text += `• Usage: ${getProgressBar(cpuUsage)}\n\n`

        text += `*STORAGE*\n`
        text += `• RAM: ${formatSize(usedMem)} / ${formatSize(totalMem)}\n`
        text += `• Load: ${getProgressBar(memPercent)}\n`
        text += `• Disk: ${formatSize(disk.used)} / ${formatSize(disk.total)}\n`
        text += `• Load: ${getProgressBar(disk.percent)}\n\n`

        text += `*PROCESS*\n`
        text += `• NodeJS: ${process.version}\n`
        text += `• Memory RSS: ${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)}MB\n`
        text += `• Platform: ${os.platform()}\n\n`

        text += `_Reported at: ${new Date().toLocaleString('id-ID')}_`

        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
    }
}
