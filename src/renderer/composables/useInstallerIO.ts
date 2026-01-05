import { ref } from 'vue'
import type { ToolInstallInfo } from '@/types/config.types'

export function useInstallerIO() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const checkAllTools = async (): Promise<Record<string, ToolInstallInfo>> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.checkAllTools()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '检测失败'
      return {}
    } finally {
      loading.value = false
    }
  }

  const checkTool = async (toolId: string): Promise<ToolInstallInfo> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.checkTool(toolId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '检测失败'
      return { installed: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const downloadTool = async (toolId: string): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.downloadTool(toolId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '下载失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  const installTool = async (toolId: string, installerPath?: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.installTool(toolId, installerPath)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '安装失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const configureToolEnv = async (toolId: string, toolPath: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.configureToolEnv(toolId, toolPath)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '配置失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const verifyInstallation = async (toolId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.installer.verifyInstallation(toolId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '验证失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const cancelInstallation = async (toolId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await window.electronAPI.installer.cancelInstallation(toolId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '取消失败'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    checkAllTools,
    checkTool,
    downloadTool,
    installTool,
    configureToolEnv,
    verifyInstallation,
    cancelInstallation
  }
}
