import { ref } from 'vue'
import type { ClaudeConfig, Presets } from '@/types/config.types'

export function useConfigIO() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadConfig = async (): Promise<ClaudeConfig | null> => {
    loading.value = true
    error.value = null

    try {
      const config = await window.electronAPI.config.load()
      return config
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载配置失败'
      return null
    } finally {
      loading.value = false
    }
  }

  const saveConfig = async (config: ClaudeConfig): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      console.log('[Renderer] Starting save config...')
      console.log('[Renderer] Config data:', JSON.stringify(config, null, 2))

      // Convert to plain JSON object to avoid IPC clone issues with reactive objects
      const plainConfig = JSON.parse(JSON.stringify(config))

      console.log('[Renderer] Plain config:', JSON.stringify(plainConfig, null, 2))

      const success = await window.electronAPI.config.save(plainConfig)

      console.log('[Renderer] Save result:', success)
      console.log('[Renderer] Save operation completed')

      if (!success) {
        error.value = '保存配置失败，请检查控制台日志了解详情'
        console.error('[Renderer] Save failed - main process returned false')
      }

      return success
    } catch (e) {
      console.error('[Renderer] Save config exception:', e)
      console.error('[Renderer] Error name:', e instanceof Error ? e.name : 'unknown')
      console.error('[Renderer] Error message:', e instanceof Error ? e.message : String(e))
      console.error('[Renderer] Error stack:', e instanceof Error ? e.stack : 'no stack')
      error.value = e instanceof Error ? e.message : '保存配置失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const loadPresets = async (): Promise<Presets> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.presets.load()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载预设失败'
      return {}
    } finally {
      loading.value = false
    }
  }

  const savePresets = async (presets: Presets): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      console.log('[Renderer] Starting save presets...')
      console.log('[Renderer] Presets keys:', Object.keys(presets))

      // Convert to plain JSON object to avoid IPC clone issues with reactive objects
      const plainPresets = JSON.parse(JSON.stringify(presets))

      console.log('[Renderer] Plain presets keys:', Object.keys(plainPresets))

      const success = await window.electronAPI.presets.save(plainPresets)

      console.log('[Renderer] Save presets result:', success)
      console.log('[Renderer] Save presets operation completed')

      if (!success) {
        error.value = '保存预设失败，请检查控制台日志了解详情'
        console.error('[Renderer] Save presets failed - main process returned false')
      }

      return success
    } catch (e) {
      console.error('[Renderer] Save presets exception:', e)
      console.error('[Renderer] Error name:', e instanceof Error ? e.name : 'unknown')
      console.error('[Renderer] Error message:', e instanceof Error ? e.message : String(e))
      console.error('[Renderer] Error stack:', e instanceof Error ? e.stack : 'no stack')
      error.value = e instanceof Error ? e.message : '保存预设失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const applyPreset = async (name: string): Promise<{ success: boolean; config?: ClaudeConfig }> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.presets.apply(name)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '应用预设失败'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deletePreset = async (name: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.presets.delete(name)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除预设失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const openFolder = async (): Promise<void> => {
    await window.electronAPI.system.openFolder()
  }

  const getConfigPath = async (): Promise<string> => {
    return await window.electronAPI.system.getConfigPath()
  }

  return {
    loading,
    error,
    loadConfig,
    saveConfig,
    loadPresets,
    savePresets,
    applyPreset,
    deletePreset,
    openFolder,
    getConfigPath
  }
}
