export default {
    name: "public",
    description: "Switch bot to public mode",
    ownerOnly: true,
    execute: async ({ sock, msg }) => {
        sock.public = true
        await sock.sendMessage(msg.key.remoteJid, { text: "Mode: Public" }, { quoted: msg })
    }
}
