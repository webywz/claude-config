import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')
const outDir = join(repoRoot, 'build')

mkdirSync(outDir, { recursive: true })

const BG_A = [0x66, 0x7e, 0xea]
const BG_B = [0x76, 0x4b, 0xa2]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t))
  ]
}

function degNormalize(angleDeg) {
  let a = angleDeg % 360
  if (a < 0) a += 360
  return a
}

function angleInRange(angleDeg, startDeg, endDeg) {
  const a = degNormalize(angleDeg)
  const s = degNormalize(startDeg)
  const e = degNormalize(endDeg)
  if (s <= e) return a >= s && a <= e
  return a >= s || a <= e
}

function isInsideRoundedRect(x, y, w, h, r) {
  const left = 0
  const top = 0
  const right = w
  const bottom = h

  const rx = r
  const ry = r

  const inCore =
    x >= left + rx &&
    x <= right - rx &&
    y >= top &&
    y <= bottom

  const inMiddle =
    x >= left &&
    x <= right &&
    y >= top + ry &&
    y <= bottom - ry

  if (inCore || inMiddle) return true

  const corners = [
    { cx: left + rx, cy: top + ry },
    { cx: right - rx, cy: top + ry },
    { cx: left + rx, cy: bottom - ry },
    { cx: right - rx, cy: bottom - ry }
  ]

  for (const { cx, cy } of corners) {
    const dx = x - cx
    const dy = y - cy
    if (dx * dx + dy * dy <= rx * rx) return true
  }

  return false
}

function renderIcon(size) {
  const w = size
  const h = size
  const buf = Buffer.alloc(w * h * 4)

  const pad = Math.max(1, Math.round(size * 0.09375)) // ~24px @ 256
  const r = Math.round(size * 0.22) // ~56px @ 256

  const cx = (w - 1) / 2
  const cy = (h - 1) / 2

  const ringRadius = size * 0.28
  const ringThickness = Math.max(2, size * 0.07)

  const centerRadius = size * 0.06

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rx = x - pad
      const ry = y - pad
      const innerW = w - pad * 2
      const innerH = h - pad * 2

      const inside = isInsideRoundedRect(rx, ry, innerW, innerH, r)
      if (!inside) {
        continue
      }

      const t = clamp((x + y) / (w + h - 2), 0, 1)
      const [br, bg, bb] = lerpColor(BG_A, BG_B, t)

      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI

      let ar = br
      let ag = bg
      let ab = bb
      let aa = 255

      // Ring arcs (two segments)
      const inRing = Math.abs(dist - ringRadius) <= ringThickness / 2
      const inArc =
        (inRing && angleInRange(angle, 200, 340)) ||
        (inRing && angleInRange(angle, 20, 160))

      if (inArc) {
        ar = 255
        ag = 255
        ab = 255
        aa = 235
      }

      // Center dot
      if (dist <= centerRadius) {
        ar = 11
        ag = 18
        ab = 32
        aa = 70
      }

      const idx = (y * w + x) * 4
      buf[idx] = ar
      buf[idx + 1] = ag
      buf[idx + 2] = ab
      buf[idx + 3] = aa
    }
  }

  return buf
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lengthBuf = Buffer.alloc(4)
  lengthBuf.writeUInt32BE(data.length, 0)

  const crcBuf = Buffer.alloc(4)
  const crc = crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc, 0)

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  // Raw scanlines: filter byte 0 + RGBA bytes
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const idatData = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idatData),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

function encodeIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type 1 = icon
  header.writeUInt16LE(images.length, 4)

  const entries = []
  let offset = 6 + images.length * 16

  for (const img of images) {
    const entry = Buffer.alloc(16)
    entry[0] = img.width === 256 ? 0 : img.width
    entry[1] = img.height === 256 ? 0 : img.height
    entry[2] = 0 // color count
    entry[3] = 0 // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bpp
    entry.writeUInt32LE(img.data.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += img.data.length
  }

  return Buffer.concat([header, ...entries, ...images.map(i => i.data)])
}

const sizes = [16, 32, 48, 64, 128, 256]
const images = sizes.map((size) => {
  const rgba = renderIcon(size)
  const png = encodePng(size, size, rgba)
  return { width: size, height: size, data: png }
})

const ico = encodeIco(images)

writeFileSync(join(outDir, 'icon.ico'), ico)
writeFileSync(join(outDir, 'icon.png'), images[images.length - 1].data)

console.log(`[icons] Wrote ${join('build', 'icon.ico')} and ${join('build', 'icon.png')}`)

