/** ============================================================
 *  BIOHAZARD-BOTZ — Message Helper
 *  Custom reply, fake quoted messages, newsletter forwarding
 *  Newsletter JID : 120363406219419904@newsletter (yemo-dev)
 * ============================================================ */

const BOT_NAME = 'BIOHAZARD BOTZ'
const NEWSLETTER = '120363406219419904@newsletter'
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb5tNWd8KMqfltMy1W43'
const THUMB_URL = 'https://raw.githubusercontent.com/yemo-dev/biohazard-botz/main/assets/thumb.jpg'

//================= { FAKE MESSAGES } =================\\

/** Fake contact quoted message **/
const makeFakeContact = (chat, pushName) => ({
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        ...(chat ? { remoteJid: 'status@broadcast' } : {})
    },
    message: {
        contactMessage: {
            displayName: BOT_NAME,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${pushName || BOT_NAME};;;\nFN:${pushName || BOT_NAME}\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Mobile\nEND:VCARD`
        }
    }
})

/** Fake cart/order quoted message **/
const makeFakeCart = (chat) => ({
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        ...(chat ? { remoteJid: 'status@broadcast' } : {})
    },
    message: {
        orderMessage: {
            itemCount: 9999,
            status: 1,
            surface: 1,
            message: BOT_NAME,
            orderTitle: 'B I O H A Z A R D',
            thumbnail: '',
            sellerJid: '0@s.whatsapp.net'
        }
    }
})

/** Fake event quoted message **/
const makeFakeEvent = (chat) => ({
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        ...(chat ? { remoteJid: 'status@broadcast' } : {})
    },
    message: {
        eventMessage: {
            isCanceled: false,
            name: BOT_NAME,
            description: 'yemo-dev',
            location: { degreesLatitude: 0, degreesLongitude: 0, name: 'BIOHAZARD' },
            joinLink: CHANNEL_URL,
            startTime: '0'
        }
    }
})

// Custom reply function with external ad
const makeReply = (sock, jid, quotedMsg) => async (text) => {
    return sock.sendMessage(jid, {
        text,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: NEWSLETTER,
                newsletterName: BOT_NAME,
                serverMessageId: -1
            },
            externalAdReply: {
                showAdAttribution: true,
                title: BOT_NAME,
                body: 'yemo-dev • biohazard-botz',
                previewType: 'PHOTO',
                thumbnailUrl: THUMB_URL,
                thumbnail: '',
                sourceUrl: CHANNEL_URL
            }
        }
    }, { quoted: quotedMsg, ephemeralExpiration: 0 })
}

export { makeFakeContact, makeFakeCart, makeFakeEvent, makeReply, BOT_NAME, NEWSLETTER, THUMB_URL, CHANNEL_URL }
