export default {
    name: "info",
    aliases: ["groupinfo"],
    description: "Get detailed group information",
    execute: async ({ sock, msg, isGroup }) => {
        if (!isGroup) return
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants

        let info = `G R O U P - I N F O\n\n`
        info += `- Name: ${groupMetadata.subject}\n`
        info += `- ID: ${groupMetadata.id}\n`
        info += `- Owner: ${groupMetadata.owner?.split('@')[0] || 'Unknown'}\n`
        info += `- Created: ${new Date(groupMetadata.creation * 1000).toLocaleString()}\n`
        info += `- Participants: ${participants.length}\n`
        info += `- Admins: ${participants.filter(p => p.admin).length}\n`
        info += `- Description: ${groupMetadata.desc || 'No description'}\n`

        await sock.sendMessage(msg.key.remoteJid, { text: info }, { quoted: msg })
    }
}
