export default {
    name: "hidetag",
    description: "Invisible mention all participants",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId || p.jid === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender || p.jid === sender)?.admin != null || isOwner

        if (!isAdmin) return

        const text = args.length ? args.join(" ") : ""
        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: participants.map(p => p.id)
        })
    }
}
