import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { homedir, platform } from 'os'
import { existsSync, mkdirSync, unlinkSync, createWriteStream, renameSync } from 'fs'
import { BrowserWindow } from 'electron'
import * as https from 'https'
import * as http from 'http'
import type { ToolInstallInfo, InstallStep } from '../config/types'

const execAsync = promisify(exec)

interface ToolConfig {
  id: string
  name: string
  description: string
  verifyCommand: string
  downloadUrl?: string
  downloadUrls?: string[] // 支持多个下载源（镜像源 + 回退源）
  installCommand?: string
  envPath?: string
  dependsOn?: string[]
}

export class InstallerService {
  private mainWindow: BrowserWindow | null = null
  private installCache = new Map<string, string>()
  private activeDownloads = new Map<string, boolean>()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  // 工具配置
  private getToolConfig(toolId: string): ToolConfig | null {
    const configs: Record<string, ToolConfig> = {
      nodejs: {
        id: 'nodejs',
        name: 'Node.js',
        description: 'JavaScript 运行时环境 (v20 LTS)',
        verifyCommand: 'node --version',
        // 国内镜像源 + 官方回退源
        downloadUrls: [
          // 主镜像：npmmirror.com (国内快速)
          'https://npmmirror.com/mirrors/node/v20.11.0/node-v20.11.0-{platform}-{arch}.msi',
          // 回退源：官方源
          'https://nodejs.org/dist/v20.11.0/node-v20.11.0-{platform}-{arch}.msi'
        ],
        installCommand: 'msiexec /i "{installer}" /quiet /norestart INSTALLDIR="{installDir}"',
        envPath: '{installDir}'
      },
      claude: {
        id: 'claude',
        name: 'Claude Code CLI',
        description: 'Claude 命令行工具',
        verifyCommand: 'claude --version',
        installCommand: 'npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com',
        dependsOn: ['nodejs']
      },
      codex: {
        id: 'codex',
        name: 'OpenAI Codex CLI',
        description: 'OpenAI Codex 命令行工具',
        verifyCommand: 'codex --version',
        // 通过 npm 安装，使用国内镜像源
        installCommand: 'npm install -g @openai/codex --registry=https://registry.npmmirror.com',
        dependsOn: ['nodejs']
      }
    }

    return configs[toolId] || null
  }

  // 获取安装目录
  private getInstallDir(toolId: string): string {
    return join(homedir(), '.claude-config', 'tools', toolId)
  }

  // 格式化下载 URL
  private formatDownloadUrl(url: string): string {
    const plat = platform()
    const arch = process.arch

    return url
      .replace('{platform}', plat === 'win32' ? 'win' : plat)
      .replace('{arch}', arch === 'x64' ? 'x64' : arch)
  }

  // 发送进度到渲染进程
  private sendProgress(
    toolId: string,
    step: InstallStep,
    progress: number,
    message: string
  ) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(`installer:progress:${toolId}`, {
        toolId,
        step,
        progress,
        message
      })
    }
  }

  // 下载文件
  private async downloadFile(
    url: string,
    savePath: string,
    toolId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http
      const tempPath = savePath + '.tmp'
      let timeoutTimer: NodeJS.Timeout | null = null

      // Mark download as active
      this.activeDownloads.set(toolId, true)

      const requestOptions = {
        timeout: 60000, // 60秒超时
        headers: {
          'User-Agent': 'Claude-Config-Installer/1.0'
        }
      }

      const request = protocol.get(url, requestOptions, (response) => {
        // 清除连接超时定时器
        if (timeoutTimer) {
          clearTimeout(timeoutTimer)
          timeoutTimer = null
        }

        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            this.downloadFile(redirectUrl, savePath, toolId)
              .then(() => resolve())
              .catch(reject)
          } else {
            reject(new Error('Redirect without location'))
          }
          return
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10)
        let downloadedSize = 0
        let lastProgressUpdate = 0

        const file = createWriteStream(tempPath)

        response.on('data', (chunk: Buffer) => {
          downloadedSize += chunk.length
          const now = Date.now()

          // 限制进度更新频率（每 500ms 最多一次）
          if (now - lastProgressUpdate > 500 && totalSize > 0) {
            const progress = Math.round((downloadedSize / totalSize) * 100)
            this.sendProgress(toolId, 'downloading', progress, `下载中... ${progress}%`)
            lastProgressUpdate = now
          }
        })

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          // Rename temp file to final name
          renameSync(tempPath, savePath)
          resolve()
        })

        file.on('error', (err) => {
          try {
            unlinkSync(tempPath)
          } catch {}
          reject(err)
        })
      })

      request.on('timeout', () => {
        request.destroy()
        reject(new Error('连接超时 (60s)'))
      })

      request.on('error', (err) => {
        if (timeoutTimer) {
          clearTimeout(timeoutTimer)
        }
        reject(err)
      })

      // 设置整体下载超时（5分钟）
      timeoutTimer = setTimeout(() => {
        request.destroy()
        reject(new Error('下载超时 (5min)'))
      }, 300000)
    })
  }

  // 检测工具是否已安装
  async checkTool(toolId: string): Promise<ToolInstallInfo> {
    const config = this.getToolConfig(toolId)
    if (!config) {
      return { installed: false, error: 'Unknown tool' }
    }

    try {
      const { stdout } = await execAsync(config.verifyCommand, {
        windowsHide: true,
        timeout: 10000
      })
      const version = stdout.trim().replace(/^v/, '')

      return {
        installed: true,
        version,
        path: await this.getToolPath(toolId)
      }
    } catch (error) {
      return { installed: false }
    }
  }

  // 检测所有工具
  async checkAllTools(): Promise<Record<string, ToolInstallInfo>> {
    const tools = ['nodejs', 'claude', 'codex']
    const results: Record<string, ToolInstallInfo> = {}

    for (const tool of tools) {
      results[tool] = await this.checkTool(tool)
    }

    return results
  }

  // 获取工具路径
  private async getToolPath(toolId: string): Promise<string> {
    const config = this.getToolConfig(toolId)
    if (!config) return ''

    if (toolId === 'claude') {
      try {
        const { stdout } = await execAsync('npm config get prefix', { windowsHide: true })
        return join(stdout.trim(), 'claude')
      } catch {
        return 'claude'
      }
    }

    return this.getInstallDir(toolId)
  }

  // 下载安装包
  async downloadTool(toolId: string): Promise<string> {
    const config = this.getToolConfig(toolId)
    if (!config) {
      throw new Error('Unknown tool')
    }

    // 获取下载 URL 列表（兼容新旧格式）
    let urls: string[] = []
    if (config.downloadUrls && config.downloadUrls.length > 0) {
      urls = config.downloadUrls.map(url => this.formatDownloadUrl(url))
    } else if (config.downloadUrl) {
      urls = [this.formatDownloadUrl(config.downloadUrl)]
    } else {
      throw new Error('Tool does not support downloading')
    }

    const cacheDir = join(homedir(), '.claude-config', 'cache')
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true })
    }

    const filename = this.getInstallerFilename(toolId, urls[0])
    const savePath = join(cacheDir, filename)

    // 尝试所有下载源，直到成功
    let lastError: Error | null = null
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const sourceName = i === 0 ? '主镜像源' : `备用源 ${i}`

      try {
        this.sendProgress(toolId, 'downloading', 0, `尝试 ${sourceName}...`)
        await this.downloadFile(url, savePath, toolId)
        this.sendProgress(toolId, 'downloading', 100, `下载完成 (${sourceName})`)
        this.installCache.set(toolId, savePath)
        return savePath
      } catch (error) {
        lastError = error as Error
        console.error(`下载失败 (${sourceName}):`, error)

        // 如果还有更多源，继续尝试
        if (i < urls.length - 1) {
          this.sendProgress(toolId, 'downloading', 0, `${sourceName} 失败，尝试下一个源...`)
          // 清理可能的部分下载文件
          try {
            if (existsSync(savePath)) {
              unlinkSync(savePath)
            }
          } catch {}
        }
      }
    }

    // 所有源都失败
    const errorMsg = `所有下载源均失败: ${lastError?.message || 'Unknown error'}`
    this.sendProgress(toolId, 'failed', 0, errorMsg)
    throw new Error(errorMsg)
  }

  // 获取安装包文件名
  private getInstallerFilename(toolId: string, url: string): string {
    const urlParts = url.split('/')
    return `${toolId}-${urlParts[urlParts.length - 1]}`
  }

  // 安装工具
  async installTool(toolId: string, installerPath?: string): Promise<boolean> {
    const config = this.getToolConfig(toolId)
    if (!config) {
      throw new Error('Unknown tool')
    }

    // 检查依赖
    if (config.dependsOn) {
      for (const dep of config.dependsOn) {
        const depStatus = await this.checkTool(dep)
        if (!depStatus.installed) {
          throw new Error(`请先安装 ${dep}`)
        }
      }
    }

    this.sendProgress(toolId, 'installing', 0, '开始安装...')

    try {
      const installDir = this.getInstallDir(toolId)
      if (!existsSync(installDir)) {
        mkdirSync(installDir, { recursive: true })
      }

      let command = config.installCommand || ''

      if (installerPath && command.includes('{installer}')) {
        command = command.replace('{installer}', installerPath)
      }
      command = command.replace('{installDir}', installDir)

      this.sendProgress(toolId, 'installing', 30, '安装中...')

      await execAsync(command, {
        windowsHide: true,
        timeout: 300000
      })

      this.sendProgress(toolId, 'installing', 100, '安装完成')
      return true
    } catch (error) {
      const errorMsg = (error as Error).message
      this.sendProgress(toolId, 'failed', 0, `安装失败: ${errorMsg}`)
      throw error
    }
  }

  // 配置环境变量
  async configureToolEnv(toolId: string): Promise<boolean> {
    const config = this.getToolConfig(toolId)
    if (!config || !config.envPath) return true

    this.sendProgress(toolId, 'configuring', 0, '配置环境变量...')

    try {
      const installDir = this.getInstallDir(toolId)
      const envPath = config.envPath.replace('{installDir}', installDir)

      await execAsync(`setx PATH "${process.env.PATH};${envPath}"`, {
        windowsHide: true
      })

      this.sendProgress(toolId, 'configuring', 100, '环境变量配置完成')
      return true
    } catch (error) {
      this.sendProgress(toolId, 'failed', 0, '环境变量配置失败')
      return false
    }
  }

  // 验证安装
  async verifyInstallation(toolId: string): Promise<boolean> {
    this.sendProgress(toolId, 'verifying', 0, '验证安装...')

    const result = await this.checkTool(toolId)

    if (result.installed) {
      this.sendProgress(toolId, 'completed', 100, `安装成功！版本: ${result.version || 'unknown'}`)
      return true
    } else {
      this.sendProgress(toolId, 'failed', 0, '验证失败')
      return false
    }
  }

  // 取消安装
  async cancelInstallation(toolId: string): Promise<void> {
    // Cancel any active download
    this.activeDownloads.set(toolId, false)

    // Clean up cached installer
    const cachedPath = this.installCache.get(toolId)
    if (cachedPath && existsSync(cachedPath)) {
      try {
        unlinkSync(cachedPath)
      } catch (error) {
        console.error('Failed to delete cached installer:', error)
      }
    }
    this.installCache.delete(toolId)
  }
}
