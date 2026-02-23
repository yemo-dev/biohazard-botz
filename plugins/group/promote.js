export default {
    name: "promote",
    description: "Promote participants to admin",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin) return

        let jids = []
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            jids = msg.message.extendedTextMessage.contextInfo.mentionedJid
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            jids = [msg.message.extendedTextMessage.contextInfo.participant]
        } else if (args[0]) {
            jids = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        }

        if (jids.length) {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, jids, "promote")
        }
    }
}
