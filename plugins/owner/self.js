export default {
    name: "self",
    description: "Switch bot to owner-only mode",
    ownerOnly: true,
    execute: async ({ sock, msg }) => {
        sock.public = false
        await sock.sendMessage(msg.key.remoteJid, { text: "Mode: Self" }, { quoted: msg })
    }
}
