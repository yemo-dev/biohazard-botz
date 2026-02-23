export default {
    name: "subject",
    description: "Update the group subject",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin || !args.length) return

        await sock.groupUpdateSubject(msg.key.remoteJid, args.join(" "))
    }
}
