export default {
    name: "setting",
    description: "Manage group settings (open/close group)",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin) return

        if (args[0] === "open") {
            await sock.groupSettingUpdate(msg.key.remoteJid, "not_announcement")
        } else if (args[0] === "close") {
            await sock.groupSettingUpdate(msg.key.remoteJid, "announcement")
        }
    }
}
