export default {
    name: "tagall",
    description: "Mention all participants in the group",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin) return

        const text = args.length ? args.join(" ") : "Attention everyone"
        await sock.sendMessage(msg.key.remoteJid, {
            text: `@everyone\n\n${text}\n\n` + participants.map(p => `@${p.id.split('@')[0]}`).join(" "),
            mentions: participants.map(p => p.id)
        })
    }
}
