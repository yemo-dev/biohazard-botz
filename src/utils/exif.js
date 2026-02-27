import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'
import { spawn } from 'child_process'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'

async function imageToWebp(media) {
    const tmpOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
    fs.writeFileSync(tmpIn, media)
    await new Promise((resolve, reject) => {
        spawn('ffmpeg', ['-i', tmpIn, '-vcodec', 'libwebp', '-vf',
            "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
            tmpOut])
            .on('error', reject)
            .on('close', () => resolve(true))
    })
    const buff = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    fs.unlinkSync(tmpIn)
    return buff
}

async function videoToWebp(media) {
    const tmpOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
    fs.writeFileSync(tmpIn, media)
    await new Promise((resolve, reject) => {
        spawn('ffmpeg', ['-i', tmpIn, '-vcodec', 'libwebp', '-vf',
            "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
            '-loop', '0', '-ss', '00:00:00', '-t', '00:00:05', '-preset', 'default', '-an', '-vsync', '0', tmpOut])
            .on('error', reject)
            .on('close', () => resolve(true))
    })
    const buff = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    fs.unlinkSync(tmpIn)
    return buff
}

/**
 * Write exif metadata to WebP sticker
 * @param {Buffer} media - Media buffer
 * @param {{ packname: string, author: string }} data - Sticker metadata
 * @returns {Promise<string>} Output file path
 */
async function writeExif(media, data) {
    const fileType = await fileTypeFromBuffer(media)
    const wMedia = /webp/.test(fileType.mime) ? media
        : /image/.test(fileType.mime) ? await imageToWebp(media)
            : /video/.test(fileType.mime) ? await videoToWebp(media)
                : ''

    const tmpIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpIn, wMedia)

    if (data) {
        const img = new webp.Image()
        const json = {
            'sticker-pack-id': 'BHZD-' + Crypto.randomBytes(8).toString('hex'),
            'sticker-pack-name': data.packname || 'BIOHAZARD-BOTZ',
            'sticker-pack-publisher': data.author || 'yemo-dev',
            emojis: data.categories || [''],
            'is-avatar-sticker': 0
        }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpIn)
        fs.unlinkSync(tmpIn)
        img.exif = exif
        await img.save(tmpOut)
        return tmpOut
    }
}

export { imageToWebp, videoToWebp, writeExif }
