export default {
    name: "hidetag",
    description: "Invisible mention all participants",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin) return

        const text = args.length ? args.join(" ") : ""
        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: participants.map(p => p.id)
        })
    }
}
