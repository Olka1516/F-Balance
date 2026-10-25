import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function writePng(filePath, size, paint) {
  const row = size * 4 + 1
  const raw = Buffer.alloc(row * size)
  for (let y = 0; y < size; y++) {
    const o = y * row
    raw[o] = 0
    for (let x = 0; x < size; x++) {
      const i = o + 1 + x * 4
      const [r, g, b, a = 255] = paint(x, y, size)
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  fs.writeFileSync(filePath, png)
}

function paintIcon(x, y, size) {
  const bg = [45, 143, 111]
  const fg = [248, 249, 250]
  const s = size / 512
  const inside = (px, py, w, h) =>
    x >= px * s && x < (px + w) * s && y >= py * s && y < (py + h) * s
  if (
    inside(168, 128, 56, 256) ||
    inside(168, 128, 176, 56) ||
    inside(168, 248, 136, 48)
  ) {
    return fg
  }
  return bg
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'public', 'icons')
fs.mkdirSync(dir, { recursive: true })

for (const size of [180, 192, 512]) {
  const filePath = path.join(dir, `icon-${size}.png`)
  writePng(filePath, size, paintIcon)
  console.log(`wrote ${filePath}`)
}
