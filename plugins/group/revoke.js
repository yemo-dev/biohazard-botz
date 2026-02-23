export default {
    name: "revoke",
    description: "Revoke the group invite link",
    execute: async ({ sock, msg, isGroup, isOwner, sender }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        if (!isAdmin || !botAdmin) return

        await sock.groupRevokeInvite(msg.key.remoteJid)
        await sock.sendMessage(msg.key.remoteJid, { text: "Link revoked" })
    }
}
