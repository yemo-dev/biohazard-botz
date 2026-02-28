export default {
    name: "ephemeral",
    description: "Toggle disappearing messages in group",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId || p.jid === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender || p.jid === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin) return

        const duration = parseInt(args[0]) || 0
        await sock.groupToggleEphemeral(msg.key.remoteJid, duration)
    }
}
