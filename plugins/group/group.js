/** 
 * Comprehensive Group Management Plugin for Biohazard Botz
 * Full group features only accessible via groups.
 **/

export default {
    name: "group",
    aliases: ["groupinfo", "add", "kick", "promote", "demote", "subject", "desc", "link", "revoke", "tagall", "hidetag", "ephemeral", "setting"],
    description: "Manage group settings and participants",
    execute: async ({ sock, msg, args, isGroup, isOwner, sender }) => {
        /** Enforce group only access **/
        if (!isGroup) return

        const remoteJid = msg.key.remoteJid
        const cmd = msg.body.slice(1).trim().split(/ +/).shift().toLowerCase()

        /** Helper to check if bot is admin **/
        const groupMetadata = await sock.groupMetadata(remoteJid)
        const participants = groupMetadata.participants
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const botAdmin = participants.find(p => p.id === botId)?.admin != null
        const isAdmin = participants.find(p => p.id === sender)?.admin != null || isOwner

        const getJid = (text) => {
            if (!text) return null
            const jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            return jid
        }

        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant

        const targetJids = [...mentionedJids]
        if (quotedSender) targetJids.push(quotedSender)
        if (args[0] && !targetJids.length) targetJids.push(getJid(args[0]))

        switch (cmd) {
            case "group":
            case "groupinfo":
                let info = `G R O U P - I N F O\n\n`
                info += `- Name: ${groupMetadata.subject}\n`
                info += `- ID: ${groupMetadata.id}\n`
                info += `- Owner: ${groupMetadata.owner?.split('@')[0] || 'Unknown'}\n`
                info += `- Created: ${new Date(groupMetadata.creation * 1000).toLocaleString()}\n`
                info += `- Participants: ${participants.length}\n`
                info += `- Admins: ${participants.filter(p => p.admin).length}\n`
                info += `- Description: ${groupMetadata.desc || 'No description'}\n`
                await sock.sendMessage(remoteJid, { text: info }, { quoted: msg })
                break

            case "add":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (!targetJids.length) return
                await sock.groupParticipantsUpdate(remoteJid, targetJids, "add")
                break

            case "kick":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (!targetJids.length) return
                await sock.groupParticipantsUpdate(remoteJid, targetJids, "remove")
                break

            case "promote":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (!targetJids.length) return
                await sock.groupParticipantsUpdate(remoteJid, targetJids, "promote")
                break

            case "demote":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (!targetJids.length) return
                await sock.groupParticipantsUpdate(remoteJid, targetJids, "demote")
                break

            case "subject":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (!args.length) return
                await sock.groupUpdateSubject(remoteJid, args.join(" "))
                break

            case "desc":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                await sock.groupUpdateDescription(remoteJid, args.join(" "))
                break

            case "link":
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                const code = await sock.groupInviteCode(remoteJid)
                await sock.sendMessage(remoteJid, { text: `https://chat.whatsapp.com/${code}` }, { quoted: msg })
                break

            case "revoke":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                await sock.groupRevokeInvite(remoteJid)
                await sock.sendMessage(remoteJid, { text: "Link revoked" })
                break

            case "tagall":
                if (!isAdmin) return
                const tagMessage = args.length ? args.join(" ") : "Attention everyone"
                await sock.sendMessage(remoteJid, {
                    text: `@everyone\n\n${tagMessage}\n\n` + participants.map(p => `@${p.id.split('@')[0]}`).join(" "),
                    mentions: participants.map(p => p.id)
                })
                break

            case "hidetag":
                if (!isAdmin) return
                const hideMessage = args.length ? args.join(" ") : ""
                await sock.sendMessage(remoteJid, {
                    text: hideMessage,
                    mentions: participants.map(p => p.id)
                })
                break

            case "ephemeral":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                const duration = parseInt(args[0]) || 0
                await sock.groupToggleEphemeral(remoteJid, duration)
                break

            case "setting":
                if (!isAdmin) return
                if (!botAdmin) return await sock.sendMessage(remoteJid, { text: "Bot must be admin" })
                if (args[0] === "open") {
                    await sock.groupSettingUpdate(remoteJid, "not_announcement")
                } else if (args[0] === "close") {
                    await sock.groupSettingUpdate(remoteJid, "announcement")
                }
                break
        }
    }
}
