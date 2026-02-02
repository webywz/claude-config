import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')
const outDir = join(repoRoot, 'build')

mkdirSync(outDir, { recursive: true })

// 源文件：使用 resources 目录下的精品 3D PNG 图标
const sourceIconPath = join(repoRoot, 'resources', 'icon.png')
const sourcePngData = readFileSync(sourceIconPath)

// 策略调整：不再手动生成损坏的 ICO。
// 直接提供 512x512 或 1024x1024 的高质量 PNG 给 electron-builder。
// 它会自动调用内置工具生成完美兼容的 Windows 图标。
writeFileSync(join(outDir, 'icon.png'), sourcePngData)

console.log(`[icons-v4] Premium icon source synced to build/icon.png for electron-builder auto-generation.`)
