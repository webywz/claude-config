import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CodexConfig, CodexAuth, CodexPresets } from '@/types/config.types'
import { useCodexIO } from '@/composables/useCodexIO'

export const useCodexStore = defineStore('codex', () => {
  const codexIO = useCodexIO()

  const config = ref<CodexConfig>({
    model_provider: 'openai',
    model: 'gpt-4',
    model_providers: {
      openai: {
        base_url: ''
      }
    }
  })

  const auth = ref<CodexAuth>({})
  const presets = ref<CodexPresets>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const configPath = ref('')
  const authPath = ref('')
  const configRaw = ref('')
  const statusMessage = ref<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const PROVIDERS = ['openai', 'anthropic', 'fox', 'custom']

  const activeProvider = computed(() => config.value.model_provider)
  const providerConfigs = computed(() => Object.keys(config.value.model_providers || {}))
  const presetNames = computed(() => Object.keys(presets.value))

  async function loadConfig() {
    loading.value = true
    const loaded = await codexIO.loadConfig()
    if (loaded) {
      config.value = loaded
    }
    loading.value = false
  }

  async function loadAuth() {
    loading.value = true
    const loaded = await codexIO.loadAuth()
    if (loaded) {
      auth.value = loaded
    }
    loading.value = false
  }

  async function loadPaths() {
    configPath.value = await codexIO.getConfigPath()
    authPath.value = await codexIO.getAuthPath()
  }

  async function loadConfigRaw() {
    configRaw.value = await codexIO.getConfigRaw()
  }

  async function loadPresets() {
    loading.value = true
    presets.value = await codexIO.loadPresets()
    loading.value = false
  }

  async function saveConfig() {
    loading.value = true
    const success = await codexIO.saveConfig(config.value)
    loading.value = false

    if (success) {
      statusMessage.value = { text: 'Codex config saved!', type: 'success' }
      await loadConfigRaw()
    } else {
      statusMessage.value = { text: 'Failed to save', type: 'error' }
    }

    return success
  }

  async function savePreset(name: string) {
    if (!name) {
      statusMessage.value = { text: 'Please enter a preset name', type: 'error' }
      return false
    }

    presets.value[name] = JSON.parse(JSON.stringify(config.value))
    const success = await codexIO.savePresets(presets.value)

    if (success) {
      statusMessage.value = { text: `Preset "${name}" saved`, type: 'success' }
    } else {
      statusMessage.value = { text: 'Failed to save preset', type: 'error' }
    }

    return success
  }

  async function applyPreset(name: string) {
    const result = await codexIO.applyPreset(name)

    if (result.success && result.config) {
      config.value = result.config
      statusMessage.value = { text: `Preset "${name}" applied`, type: 'success' }
      await loadConfigRaw()
    } else {
      statusMessage.value = { text: 'Failed to apply preset', type: 'error' }
    }

    return result.success
  }

  async function deletePreset(name: string) {
    const success = await codexIO.deletePreset(name)

    if (success) {
      delete presets.value[name]
      statusMessage.value = { text: `Preset "${name}" deleted`, type: 'success' }
    } else {
      statusMessage.value = { text: 'Failed to delete preset', type: 'error' }
    }

    return success
  }

  async function saveAuth() {
    loading.value = true
    const success = await codexIO.saveAuth(auth.value)
    loading.value = false

    if (success) {
      statusMessage.value = { text: 'Auth keys saved!', type: 'success' }
    } else {
      statusMessage.value = { text: 'Failed to save auth', type: 'error' }
    }

    return success
  }

  function setActiveProvider(provider: string) {
    config.value.model_provider = provider
  }

  function setModel(model: string) {
    config.value.model = model
  }

  function setModelReasoningEffort(effort: string) {
    config.value.model_reasoning_effort = effort
  }

  function setDisableResponseStorage(disabled: boolean) {
    config.value.disable_response_storage = disabled
  }

  function updateProviderConfig(provider: string, field: string, value: string) {
    if (!config.value.model_providers) {
      config.value.model_providers = {}
    }
    if (!config.value.model_providers[provider]) {
      config.value.model_providers[provider] = {}
    }
    config.value.model_providers[provider][field] = value
  }

  function addProvider(name: string) {
    if (!config.value.model_providers) {
      config.value.model_providers = {}
    }
    if (!config.value.model_providers[name]) {
      config.value.model_providers[name] = {
        base_url: ''
      }
    }
  }

  function removeProvider(name: string) {
    if (!config.value.model_providers) {
      return
    }
    delete config.value.model_providers[name]
    if (config.value.model_provider === name) {
      config.value.model_provider = Object.keys(config.value.model_providers)[0] || ''
    }
  }

  function updateAuthKey(envVar: string, value: string) {
    if (value) {
      auth.value[envVar] = value
    } else {
      delete auth.value[envVar]
    }
  }

  async function openFolder() {
    await codexIO.openFolder()
  }

  function clearStatus() {
    statusMessage.value = null
  }

  return {
    config,
    auth,
    presets,
    loading,
    error,
    configPath,
    authPath,
    configRaw,
    statusMessage,
    PROVIDERS,
    activeProvider,
    providerConfigs,
    presetNames,
    loadConfig,
    loadAuth,
    loadPaths,
    loadConfigRaw,
    loadPresets,
    saveConfig,
    saveAuth,
    savePreset,
    applyPreset,
    deletePreset,
    setActiveProvider,
    setModel,
    setModelReasoningEffort,
    setDisableResponseStorage,
    updateProviderConfig,
    addProvider,
    removeProvider,
    updateAuthKey,
    openFolder,
    clearStatus
  }
})
