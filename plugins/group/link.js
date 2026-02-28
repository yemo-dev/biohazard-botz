export default {
    name: "link",
    description: "Get the group invite link",
    execute: async ({ sock, msg, isGroup }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId || p.jid === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender || p.jid === sender)?.admin != null || isOwnerock.groupInviteCode(msg.key.remoteJid)
        await sock.sendMessage(msg.key.remoteJid, { text: `https://chat.whatsapp.com/${code}` }, { quoted: msg })
    }
}
