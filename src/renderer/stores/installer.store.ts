import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useInstallerIO } from '@/composables/useInstallerIO'
import type { ToolInstallInfo, InstallProgress } from '@/types/config.types'

export interface InstallLog {
  id: string
  time: string
  toolId: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export interface ToolStatus {
  installed: boolean
  version?: string
  installing: boolean
  progress: number
  step: string
  error?: string
}

export const useInstallerStore = defineStore('installer', () => {
  const installerIO = useInstallerIO()

  // State
  const tools = ref(['nodejs', 'claude', 'codex'])
  const toolStatus = ref<Record<string, ToolStatus>>({
    nodejs: { installed: false, installing: false, progress: 0, step: '' },
    claude: { installed: false, installing: false, progress: 0, step: '' },
    codex: { installed: false, installing: false, progress: 0, step: '' }
  })
  const logs = ref<InstallLog[]>([])
  const installing = ref(false)
  const currentTool = ref<string | null>(null)
  const overallProgress = ref(0)

  // Computed
  const allInstalled = computed(() => {
    return Object.values(toolStatus.value).every(status => status.installed)
  })

  const installedCount = computed(() => {
    return Object.values(toolStatus.value).filter(status => status.installed).length
  })

  const canInstallAll = computed(() => {
    return !installing.value && !allInstalled.value
  })

  // Actions
  async function checkAllTools() {
    const results = await installerIO.checkAllTools()

    for (const [toolId, info] of Object.entries(results)) {
      if (info.installed) {
        toolStatus.value[toolId] = {
          installed: true,
          version: info.version,
          installing: false,
          progress: 100,
          step: 'completed'
        }
        addLog(toolId, `已安装 ${info.version || ''}`, 'success')
      } else {
        toolStatus.value[toolId] = {
          installed: false,
          installing: false,
          progress: 0,
          step: ''
        }
        addLog(toolId, '未安装', 'info')
      }
    }
  }

  async function installTool(toolId: string) {
    if (installing.value) return

    installing.value = true
    currentTool.value = toolId

    // Update status
    toolStatus.value[toolId] = {
      ...toolStatus.value[toolId],
      installing: true,
      progress: 0,
      step: 'checking',
      error: undefined
    }

    // Listen for progress updates
    const progressChannel = `installer:progress:${toolId}`
    const progressHandler = (_event: any, data: InstallProgress) => {
      if (data.toolId === toolId) {
        toolStatus.value[toolId] = {
          ...toolStatus.value[toolId],
          progress: data.progress,
          step: data.step
        }
        addLog(toolId, data.message, 'info')
      }
    }

    window.electronAPI?.on?.(progressChannel, progressHandler)

    try {
      addLog(toolId, '开始安装...', 'info')

      // Check if tool needs download
      if (toolId === 'nodejs' || toolId === 'codex') {
        addLog(toolId, '下载安装包...', 'info')
        toolStatus.value[toolId].step = 'downloading'
        const installerPath = await installerIO.downloadTool(toolId)

        // Install
        addLog(toolId, '安装中...', 'info')
        toolStatus.value[toolId].step = 'installing'
        const installSuccess = await installerIO.installTool(toolId, installerPath)
        if (!installSuccess) {
          throw new Error('安装失败')
        }

        // Configure env
        addLog(toolId, '配置环境变量...', 'info')
        toolStatus.value[toolId].step = 'configuring'
        await installerIO.configureToolEnv(toolId, installerPath)
      } else if (toolId === 'claude') {
        // Check Node.js dependency
        const nodeStatus = toolStatus.value.nodejs
        if (!nodeStatus.installed) {
          throw new Error('请先安装 Node.js')
        }

        // Install via npm
        addLog(toolId, '通过 npm 安装...', 'info')
        toolStatus.value[toolId].step = 'installing'
        const installSuccess = await installerIO.installTool(toolId)
        if (!installSuccess) {
          throw new Error('安装失败')
        }
      }

      // Verify
      addLog(toolId, '验证安装...', 'info')
      toolStatus.value[toolId].step = 'verifying'
      const verified = await installerIO.verifyInstallation(toolId)

      if (verified) {
        addLog(toolId, '安装成功！', 'success')
        // Refresh status
        const status = await installerIO.checkTool(toolId)
        toolStatus.value[toolId] = {
          installed: true,
          version: status.version,
          installing: false,
          progress: 100,
          step: 'completed'
        }

        // Update overall progress
        overallProgress.value = (installedCount.value / tools.value.length) * 100
      } else {
        throw new Error('验证失败')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      addLog(toolId, `安装失败: ${errorMsg}`, 'error')
      toolStatus.value[toolId] = {
        ...toolStatus.value[toolId],
        installing: false,
        progress: 0,
        step: 'failed',
        error: errorMsg
      }
    } finally {
      window.electronAPI?.removeListener?.(progressChannel, progressHandler)
      installing.value = false
      currentTool.value = null
    }
  }

  async function installAll() {
    const uninstalled = tools.value.filter((tool) => !toolStatus.value[tool]?.installed)

    for (const tool of uninstalled) {
      await installTool(tool)
    }
  }

  function addLog(toolId: string, message: string, type: InstallLog['type']) {
    logs.value.push({
      id: `${toolId}-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      toolId,
      message,
      type
    })
  }

  function clearLogs() {
    logs.value = []
  }

  async function cancelInstallation(toolId: string) {
    await installerIO.cancelInstallation(toolId)

    // Update status
    if (toolStatus.value[toolId]) {
      toolStatus.value[toolId].installing = false
      toolStatus.value[toolId].step = 'cancelled'
      toolStatus.value[toolId].progress = 0
    }

    addLog(toolId, '已取消安装', 'warning')
  }

  return {
    tools,
    toolStatus,
    logs,
    installing,
    currentTool,
    overallProgress,
    allInstalled,
    installedCount,
    canInstallAll,
    checkAllTools,
    installTool,
    installAll,
    clearLogs,
    cancelInstallation
  }
})
