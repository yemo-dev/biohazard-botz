export default {
    name: "promote",
    aliases: ["pm", "admin"],
    description: "Promote participants to admin in the group",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId || p.jid === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender || p.jid === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin) {
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ You or the bot must be an admin to use this command." }, { quoted: msg })
            return
        }

        let jids = []
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            jids = msg.message.extendedTextMessage.contextInfo.mentionedJid
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            jids = [msg.message.extendedTextMessage.contextInfo.participant]
        } else if (args[0]) {
            jids = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        }

        if (jids.length) {
            try {
                await sock.groupParticipantsUpdate(msg.key.remoteJid, jids, "promote")
                await sock.sendMessage(msg.key.remoteJid, { text: "✅ Successfully promoted to admin." }, { quoted: msg })
            } catch (err) {
                await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to promote." }, { quoted: msg })
            }
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Please mention or reply to a user, or provide their number." }, { quoted: msg })
        }
    }
}
