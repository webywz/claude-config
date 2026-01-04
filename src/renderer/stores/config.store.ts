import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClaudeConfig, Presets } from '@/types/config.types'
import { useConfigIO } from '@/composables/useConfigIO'

export const useConfigStore = defineStore('config', () => {
  const configIO = useConfigIO()

  const config = ref<ClaudeConfig>({
    env: {},
    model: '',
    includeCoAuthoredBy: false,
    permissions: { allow: [], deny: [] }
  })

  const presets = ref<Presets>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const configPath = ref('')
  const statusMessage = ref<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const MODELS = [
    // Claude 4.5 Series (2025)
    'claude-opus-4-5-20251101',
    'claude-opus-4-5-20251101-thinking',
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-5-20250929-thinking',
    'claude-haiku-4-5-20251001',
    // Claude 4 Series (2025)
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    // Claude 3.5 Series (2024)
    'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-20241022',
    // Claude 3 Series (2024)
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    // GLM Series (智谱AI)
    'glm-4-plus',
    'glm-4.7',
    'glm-4.6',
    'glm-4.5',
    'glm-4-airx',
    'glm-4-long',
    'glm-4-flashx',
    'glm-4-flash-250414',
    'glm-4-air-250414'
  ]

  // Computed properties
  const token = computed(() =>
    config.value.env.ANTHROPIC_AUTH_TOKEN ||
    config.value.env.ANTHROPIC_API_KEY ||
    ''
  )

  const baseUrl = computed(() =>
    config.value.env.ANTHROPIC_BASE_URL ||
    'https://api.anthropic.com'
  )

  const disableTelemetry = computed(() =>
    config.value.env.DISABLE_TELEMETRY === '1'
  )

  const disableTraffic = computed(() =>
    config.value.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC === '1'
  )

  const presetNames = computed(() => Object.keys(presets.value))

  // Actions
  async function loadConfig() {
    loading.value = true
    const loaded = await configIO.loadConfig()
    if (loaded) {
      config.value = loaded
    }
    loading.value = false
  }

  async function loadPresets() {
    loading.value = true
    presets.value = await configIO.loadPresets()
    loading.value = false
  }

  async function loadConfigPath() {
    configPath.value = await configIO.getConfigPath()
  }

  async function saveConfig() {
    loading.value = true
    console.log('[Store] Starting save config...')
    console.log('[Store] Current config:', JSON.stringify(config.value, null, 2))

    const success = await configIO.saveConfig(config.value)

    loading.value = false

    console.log('[Store] Save config result:', success)

    if (success) {
      statusMessage.value = { text: '已保存!', type: 'success' }
    } else {
      statusMessage.value = { text: '保存失败', type: 'error' }
    }

    return success
  }

  function updateToken(value: string) {
    if (value) {
      config.value.env.ANTHROPIC_AUTH_TOKEN = value
    } else {
      delete config.value.env.ANTHROPIC_AUTH_TOKEN
      delete config.value.env.ANTHROPIC_API_KEY
    }
  }

  function updateBaseUrl(value: string) {
    if (value) {
      config.value.env.ANTHROPIC_BASE_URL = value
    } else {
      delete config.value.env.ANTHROPIC_BASE_URL
    }
  }

  function updateModel(value: string) {
    config.value.model = value
  }

  function toggleTelemetry(enabled: boolean) {
    config.value.env.DISABLE_TELEMETRY = enabled ? '1' : undefined
  }

  function toggleTraffic(enabled: boolean) {
    config.value.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = enabled ? '1' : undefined
  }

  function toggleCoAuthor(enabled: boolean) {
    config.value.includeCoAuthoredBy = enabled
  }

  async function savePreset(name: string) {
    if (!name) {
      statusMessage.value = { text: '请输入预设名称', type: 'error' }
      return false
    }

    // Deep copy the config to avoid reference issues
    presets.value[name] = JSON.parse(JSON.stringify(config.value))
    console.log('[Store] Saving preset:', name)
    console.log('[Store] Preset config:', JSON.stringify(presets.value[name], null, 2))

    const success = await configIO.savePresets(presets.value)

    if (success) {
      statusMessage.value = { text: `预设 '${name}' 已保存`, type: 'success' }
    } else {
      statusMessage.value = { text: '预设保存失败', type: 'error' }
    }

    return success
  }

  async function applyPreset(name: string) {
    const result = await configIO.applyPreset(name)

    if (result.success && result.config) {
      config.value = result.config
      statusMessage.value = { text: `已应用 '${name}'`, type: 'success' }
    } else {
      statusMessage.value = { text: '应用失败', type: 'error' }
    }

    return result.success
  }

  async function deletePreset(name: string) {
    const success = await configIO.deletePreset(name)

    if (success) {
      delete presets.value[name]
      statusMessage.value = { text: `已删除 '${name}'`, type: 'success' }
    } else {
      statusMessage.value = { text: '删除失败', type: 'error' }
    }

    return success
  }

  async function openFolder() {
    await configIO.openFolder()
  }

  function clearStatus() {
    statusMessage.value = null
  }

  return {
    config,
    presets,
    loading,
    error,
    configPath,
    statusMessage,
    MODELS,
    token,
    baseUrl,
    disableTelemetry,
    disableTraffic,
    presetNames,
    loadConfig,
    loadPresets,
    loadConfigPath,
    saveConfig,
    updateToken,
    updateBaseUrl,
    updateModel,
    toggleTelemetry,
    toggleTraffic,
    toggleCoAuthor,
    savePreset,
    applyPreset,
    deletePreset,
    openFolder,
    clearStatus
  }
})
