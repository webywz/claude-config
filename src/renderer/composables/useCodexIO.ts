import { ref } from 'vue'
import type { CodexConfig, CodexAuth, CodexPresets } from '@/types/config.types'

export function useCodexIO() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadConfig = async (): Promise<CodexConfig | null> => {
    loading.value = true
    error.value = null

    try {
      const config = await window.electronAPI.codex.loadConfig()
      return config
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load Codex config'
      return null
    } finally {
      loading.value = false
    }
  }

  const saveConfig = async (config: CodexConfig): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const plainConfig = JSON.parse(JSON.stringify(config))
      const success = await window.electronAPI.codex.saveConfig(plainConfig)

      if (!success) {
        error.value = 'Failed to save Codex config'
      }

      return success
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save config'
      return false
    } finally {
      loading.value = false
    }
  }

  const loadAuth = async (): Promise<CodexAuth> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.codex.loadAuth()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load auth'
      return {}
    } finally {
      loading.value = false
    }
  }

  const saveAuth = async (auth: CodexAuth): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const plainAuth = JSON.parse(JSON.stringify(auth))
      const success = await window.electronAPI.codex.saveAuth(plainAuth)

      if (!success) {
        error.value = 'Failed to save auth keys'
      }

      return success
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save auth'
      return false
    } finally {
      loading.value = false
    }
  }

  const getConfigPath = async (): Promise<string> => {
    return await window.electronAPI.codex.getConfigPath()
  }

  const getAuthPath = async (): Promise<string> => {
    return await window.electronAPI.codex.getAuthPath()
  }

  const getConfigRaw = async (): Promise<string> => {
    return await window.electronAPI.codex.getConfigRaw()
  }

  const openFolder = async (): Promise<void> => {
    await window.electronAPI.system.openCodexFolder()
  }

  const loadPresets = async (): Promise<CodexPresets> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.codex.loadPresets()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load Codex presets'
      return {}
    } finally {
      loading.value = false
    }
  }

  const savePresets = async (presets: CodexPresets): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const plainPresets = JSON.parse(JSON.stringify(presets))
      const success = await window.electronAPI.codex.savePresets(plainPresets)

      if (!success) {
        error.value = 'Failed to save Codex presets'
      }

      return success
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save Codex presets'
      return false
    } finally {
      loading.value = false
    }
  }

  const applyPreset = async (name: string): Promise<{ success: boolean; config?: CodexConfig }> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.codex.applyPreset(name)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to apply preset'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deletePreset = async (name: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      return await window.electronAPI.codex.deletePreset(name)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete preset'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    loadConfig,
    saveConfig,
    loadAuth,
    saveAuth,
    getConfigPath,
    getAuthPath,
    getConfigRaw,
    openFolder,
    loadPresets,
    savePresets,
    applyPreset,
    deletePreset
  }
}
