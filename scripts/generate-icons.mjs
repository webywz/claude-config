import { mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')
const outDir = join(repoRoot, 'build')

mkdirSync(outDir, { recursive: true })

// 源文件：使用 resources 目录下的精品 3D PNG 图标
const sourceIconPath = join(repoRoot, 'resources', 'icon.png')
const sourcePngData = readFileSync(sourceIconPath)

// 生成内容的 MD5 哈希作为文件名，确保每次内容变化文件名都不同
const hash = createHash('md5').update(sourcePngData).digest('hex').substring(0, 8)
const iconName = `icon-${hash}.png`

// 清理 build 目录下旧的 icon-*.png 文件
readdirSync(outDir).forEach(file => {
    if (file.startsWith('icon-') && file.endsWith('.png')) {
        unlinkSync(join(outDir, file))
    }
})

// 策略调整：提供唯一命名的 PNG 给 electron-builder
writeFileSync(join(outDir, iconName), sourcePngData)

// 生成动态配置片段，供打包时引入或替换
const builderConfigOverride = {
    win: {
        icon: `build/${iconName}`
    }
}
writeFileSync(join(outDir, 'icon-config.json'), JSON.stringify(builderConfigOverride, null, 2))

console.log(`[icons-v4] Icon hashed to ${iconName}. Config saved to build/icon-config.json.`)
