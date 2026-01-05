<template>
  <div class="app-container">
    <!-- AI Avatar Header -->
    <div class="ai-header" :class="{ 'glow-effect': isActive }">
      <div class="ai-avatar-container">
        <div class="ai-avatar">
          <img class="ai-icon" :src="logoUrl" alt="Claude Config" />
          <div class="ai-pulse" v-if="loading"></div>
        </div>
        <div class="ai-status" :class="{ online: !loading }"></div>
      </div>
      <div class="header-text">
        <h1 class="title">Claude Code Settings</h1>
        <p class="subtitle">{{ configPath || 'Loading...' }}</p>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="tab-switcher">
      <button
        :class="['tab-btn', { active: activeTab === 'claude' }]"
        @click="activeTab = 'claude'"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Claude 配置
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'codex' }]"
        @click="activeTab = 'codex'"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" stroke-width="2"/>
          <path d="M10 9H14M10 12H12M10 15H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Codex 配置
      </button>
    </div>

    <div class="content">
      <transition name="fade" mode="out-in" @enter="handleTabEnter">
        <!-- Claude Configuration Tab -->
        <div v-if="activeTab === 'claude'" key="claude" class="tab-content">
          <!-- Smart Suggestion Banner -->
          <transition name="slide-fade">
            <div v-if="smartSuggestion" class="smart-suggestion">
              <div class="suggestion-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#ffffff"/>
                      <stop offset="100%" stop-color="#e2e8f0"/>
                    </linearGradient>
                    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGradient)" filter="url(#starGlow)"/>
                </svg>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-title">AI 智能提示</div>
                <div class="suggestion-text">{{ smartSuggestion }}</div>
              </div>
              <button class="suggestion-close" @click="smartSuggestion = ''">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </transition>

      <el-form label-position="top" class="config-form">
        <!-- API Token with smart hint -->
        <div class="form-group" data-animate="1">
          <el-form-item label="API Token">
            <el-input
              v-model="tokenValue"
              type="password"
              placeholder="sk-ant-..."
              show-password
              @focus="handleTokenFocus"
              @input="handleTokenInput"
            />
          </el-form-item>
          <transition name="fade">
            <div v-if="tokenHint" class="input-hint">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ tokenHint }}
            </div>
          </transition>
        </div>

        <!-- API URL -->
        <div class="form-group" data-animate="2">
          <el-form-item label="API URL">
            <el-input
              v-model="urlValue"
              placeholder="https://api.anthropic.com"
              @input="handleUrlInput"
            />
          </el-form-item>
          <transition name="fade">
            <div v-if="urlHint" class="input-hint success">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ urlHint }}
            </div>
          </transition>
        </div>

        <!-- Model Selection -->
        <div class="form-group" data-animate="3">
          <el-form-item label="Model">
            <el-select v-model="modelValue" placeholder="选择模型..." filterable>
              <el-option-group label="Claude 4.5 系列">
                <el-option label="Claude Opus 4.5 (最强)" value="claude-opus-4-5-20251101" />
                <el-option label="Claude Opus 4.5 Thinking (深度推理)" value="claude-opus-4-5-20251101-thinking" />
                <el-option label="Claude Sonnet 4.5 (平衡)" value="claude-sonnet-4-5-20250929" />
                <el-option label="Claude Sonnet 4.5 Thinking" value="claude-sonnet-4-5-20250929-thinking" />
                <el-option label="Claude Haiku 4.5 (快速)" value="claude-haiku-4-5-20251001" />
              </el-option-group>
              <el-option-group label="Claude 4 系列">
                <el-option label="Claude Opus 4" value="claude-opus-4-20250514" />
                <el-option label="Claude Sonnet 4" value="claude-sonnet-4-20250514" />
              </el-option-group>
              <el-option-group label="Claude 3.5 系列">
                <el-option label="Claude 3.5 Sonnet" value="claude-3-5-sonnet-20240620" />
                <el-option label="Claude 3.5 Haiku" value="claude-3-5-haiku-20241022" />
              </el-option-group>
              <el-option-group label="Claude 3 系列">
                <el-option label="Claude 3 Opus" value="claude-3-opus-20240229" />
                <el-option label="Claude 3 Sonnet" value="claude-3-sonnet-20240229" />
                <el-option label="Claude 3 Haiku" value="claude-3-haiku-20240307" />
              </el-option-group>
              <el-option-group label="GLM 系列 (智谱AI)">
                <el-option label="GLM-4 Plus" value="glm-4-plus" />
                <el-option label="GLM-4.7" value="glm-4.7" />
                <el-option label="GLM-4.6" value="glm-4.6" />
                <el-option label="GLM-4.5" value="glm-4.5" />
                <el-option label="GLM-4 AirX" value="glm-4-airx" />
                <el-option label="GLM-4 Long" value="glm-4-long" />
                <el-option label="GLM-4 FlashX" value="glm-4-flashx" />
                <el-option label="GLM-4 Flash (免费)" value="glm-4-flash-250414" />
                <el-option label="GLM-4 Air" value="glm-4-air-250414" />
              </el-option-group>
            </el-select>
          </el-form-item>
        </div>

        <!-- Options -->
        <div class="form-group" data-animate="4">
          <el-form-item label="选项">
            <div class="checkbox-group">
              <el-checkbox v-model="telemetryValue">
                <span class="checkbox-label">
                  <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  禁用遥测数据收集
                </span>
              </el-checkbox>
              <el-checkbox v-model="trafficValue">
                <span class="checkbox-label">
                  <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                  禁用非必要网络请求
                </span>
              </el-checkbox>
              <el-checkbox v-model="coAuthorValue">
                <span class="checkbox-label">
                  <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 16.2386 14.7614 14 12 14H8C5.23858 14 3 16.2386 3 19V21M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  提交时包含 Co-authored-by
                </span>
              </el-checkbox>
            </div>
          </el-form-item>
        </div>

        <!-- Environment Variables Editor -->
        <div class="form-group" data-animate="4.5">
          <el-form-item label="Windows 环境变量">
            <EnvVarEditor />
          </el-form-item>
        </div>

        <!-- Action Buttons -->
        <div class="form-group button-group" data-animate="5">
          <el-button type="primary" size="large" @click="handleSave" :loading="saving">
            <template #icon>
              <svg v-if="!saving" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 3L5 12.5L9 15L15.5 9L21 3V21H17V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </template>
            {{ saving ? '保存中...' : '保存配置' }}
          </el-button>
          <el-button type="info" size="large" @click="handleOpenFolder">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 6.79086 19.2091 5 17 5H11C9.34315 5 8 6.34315 8 8V9" stroke="currentColor" stroke-width="2"/>
                <path d="M3 7H13M3 7L6 4M3 7L6 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            打开目录
          </el-button>
        </div>

        <!-- Status Message -->
        <transition name="fade">
          <div v-if="statusMessage" :class="['status', statusMessage.type]">
            <svg v-if="statusMessage.type === 'success'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="statusMessage.type === 'error'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ statusMessage.text }}
          </div>
        </transition>
      </el-form>

      <!-- Presets Section -->
      <div class="presets-section" data-animate="6">
        <el-divider>
          <svg class="divider-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21V12M12 21V8M5 21V4" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round"/>
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#667eea"/>
                <stop offset="100%" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
          配置预设
        </el-divider>

        <el-form label-position="top" class="config-form">
          <div class="preset-actions">
            <el-select v-model="selectedPreset" placeholder="选择预设..." style="width: 220px" filterable>
              <el-option
                v-for="name in presetNames"
                :key="name"
                :label="name"
                :value="name"
              />
            </el-select>
            <el-button type="primary" :disabled="!selectedPreset" @click="handleApplyPreset">
              <template #icon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </template>
              应用
            </el-button>
            <el-button type="danger" :disabled="!selectedPreset" @click="handleDeletePreset">
              <template #icon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </template>
              删除
            </el-button>
          </div>

          <div class="preset-save">
            <el-input v-model="newPresetName" placeholder="输入预设名称..." style="width: 220px" />
            <el-button type="success" :disabled="!newPresetName" @click="handleSavePreset">
              <template #icon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 21V13H7V21M17 21H7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </template>
              保存为预设
            </el-button>
          </div>
        </el-form>
      </div>
        </div>

        <!-- Codex Configuration Tab -->
        <div v-else key="codex" class="tab-content">
          <CodexConfigView />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '@/stores/config.store'
import { useCodexStore } from '@/stores/codex.store'
import EnvVarEditor from '@/components/EnvVarEditor.vue'
import CodexConfigView from '@/components/CodexConfigView.vue'
import logoUrl from '@/assets/logo.svg?url'

const configStore = useConfigStore()
const codexStore = useCodexStore()

const activeTab = ref<'claude' | 'codex'>('claude')

const configPath = computed(() => configStore.configPath)
const statusMessage = computed(() => configStore.statusMessage)
const MODELS = configStore.MODELS
const presetNames = computed(() => configStore.presetNames)
const loading = computed(() => configStore.loading)

const tokenValue = ref('')
const urlValue = ref('')
const modelValue = ref('')
const telemetryValue = ref(true)
const trafficValue = ref(true)
const coAuthorValue = ref(false)

const selectedPreset = ref('')
const newPresetName = ref('')
const saving = ref(false)
const isActive = ref(true)
const smartSuggestion = ref('')
const tokenHint = ref('')
const urlHint = ref('')

onMounted(async () => {
  await configStore.loadConfig()
  await configStore.loadPresets()
  await configStore.loadConfigPath()

  await codexStore.loadConfig()
  await codexStore.loadAuth()
  await codexStore.loadPresets()
  await codexStore.loadPaths()
  await codexStore.loadConfigRaw()

  tokenValue.value = configStore.token
  urlValue.value = configStore.baseUrl
  modelValue.value = configStore.config.model
  telemetryValue.value = configStore.disableTelemetry
  trafficValue.value = configStore.disableTraffic
  coAuthorValue.value = configStore.config.includeCoAuthoredBy

  // Show initial smart suggestion
  setTimeout(() => {
    if (!tokenValue.value) {
      smartSuggestion.value = '建议先配置 API Token 以使用 Claude Code'
    }
  }, 1000)

  // Animate elements on load
  animateElements()
})

watch(statusMessage, () => {
  if (statusMessage.value) {
    setTimeout(() => {
      configStore.clearStatus()
    }, 3000)
  }
})

function animateElements(root: ParentNode = document) {
  const elements = root.querySelectorAll('[data-animate]')
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animate-in')
    }, index * 100)
  })
}

function handleTabEnter(el: Element) {
  // Wait one frame so the entering tab's DOM is present, then trigger animations.
  requestAnimationFrame(() => animateElements(el))
}

// Smart hints for token
function handleTokenFocus() {
  if (!tokenValue.value) {
    tokenHint.value = '从 https://console.anthropic.com 获取 API Token'
  } else {
    tokenHint.value = ''
  }
}

function handleTokenInput(value: string) {
  if (value.length > 0 && value.length < 10) {
    tokenHint.value = 'Token 格式似乎不正确，应该以 sk-ant- 开头'
  } else if (value.startsWith('sk-ant-')) {
    tokenHint.value = ''
    smartSuggestion.value = 'Token 格式正确！现在可以配置其他选项了'
  } else {
    tokenHint.value = ''
  }
}

// Smart hints for URL
function handleUrlInput(value: string) {
  if (value.includes('anthropic.com')) {
    urlHint.value = '官方 API 端点'
  } else if (value.includes('newcli') || value.includes('glm')) {
    urlHint.value = '第三方 API 端点'
  } else {
    urlHint.value = ''
  }
}

async function handleSave() {
  saving.value = true
  configStore.updateToken(tokenValue.value)
  configStore.updateBaseUrl(urlValue.value)
  configStore.updateModel(modelValue.value)
  configStore.toggleTelemetry(telemetryValue.value)
  configStore.toggleTraffic(trafficValue.value)
  configStore.toggleCoAuthor(coAuthorValue.value)

  await configStore.saveConfig()
  saving.value = false

  // Show success suggestion
  if (statusMessage.value?.type === 'success') {
    smartSuggestion.value = '配置已保存！现在可以保存为预设以便快速切换'
  }
}

async function handleOpenFolder() {
  await configStore.openFolder()
}

async function handleApplyPreset() {
  if (!selectedPreset.value) {
    ElMessage.error('请选择预设')
    return
  }

  const success = await configStore.applyPreset(selectedPreset.value)
  if (success) {
    ElMessage.success(`已应用预设 "${selectedPreset.value}"`)
    tokenValue.value = configStore.token
    urlValue.value = configStore.baseUrl
    modelValue.value = configStore.config.model
    telemetryValue.value = configStore.disableTelemetry
    trafficValue.value = configStore.disableTraffic
    coAuthorValue.value = configStore.config.includeCoAuthoredBy
    selectedPreset.value = ''
    smartSuggestion.value = `预设 "${selectedPreset.value}" 已应用`
  }
}

async function handleDeletePreset() {
  if (!selectedPreset.value) {
    ElMessage.error('请选择预设')
    return
  }

  const success = await configStore.deletePreset(selectedPreset.value)
  if (success) {
    ElMessage.success(`已删除预设 "${selectedPreset.value}"`)
    selectedPreset.value = ''
  }
}

async function handleSavePreset() {
  if (!newPresetName.value) {
    ElMessage.error('请输入预设名称')
    return
  }

  configStore.updateToken(tokenValue.value)
  configStore.updateBaseUrl(urlValue.value)
  configStore.updateModel(modelValue.value)
  configStore.toggleTelemetry(telemetryValue.value)
  configStore.toggleTraffic(trafficValue.value)
  configStore.toggleCoAuthor(coAuthorValue.value)

  const success = await configStore.savePreset(newPresetName.value)
  if (success) {
    ElMessage.success(`预设 "${newPresetName.value}" 已保存`)
    newPresetName.value = ''
    smartSuggestion.value = `预设 "${newPresetName.value}" 已保存，可以随时快速应用`
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

/* AI Header */
.ai-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.ai-header.glow-effect {
  box-shadow: 0 4px 30px rgba(99, 102, 241, 0.1);
}

.ai-avatar-container {
  position: relative;
}

.ai-avatar {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(99, 102, 241, 0.1);
  /* animation: float 3s ease-in-out infinite; */
  position: relative;
  overflow: hidden;
}

.ai-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ai-avatar:hover::before {
  opacity: 1;
}

.ai-icon {
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 1;
}

.ai-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
  z-index: -1;
}

.ai-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid var(--bg-card);
  transition: all 0.3s ease;
}

.ai-status.online {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.header-text {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 13px;
  color: var(--text-dim);
  margin: 4px 0 0 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

/* Content */
.content {
  flex: 1;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 40px;
}

/* Smart Suggestion Banner */
.smart-suggestion {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.smart-suggestion::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s infinite;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-icon svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 2px;
}

.suggestion-text {
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.4;
}

.suggestion-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.suggestion-close:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.suggestion-close svg {
  width: 16px;
  height: 16px;
}

/* Form Groups */
.form-group {
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.form-group.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Input Hints */
.input-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 12px;
  color: var(--text-dim);
}

.input-hint svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.input-hint.success {
  border-color: var(--color-green);
  color: var(--color-green);
  background: rgba(16, 185, 129, 0.05);
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-checkbox) {
  margin: 0 !important;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.checkbox-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

:deep(.el-checkbox:hover .checkbox-icon) {
  opacity: 1;
}

/* Config Form */
.config-form {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.config-form:hover {
  box-shadow: var(--shadow-lg);
}

/* Button Group */
.button-group {
  display: flex;
  gap: 12px;
}

:deep(.el-button--large) {
  height: 48px;
  font-size: 15px;
  flex: 1;
}

:deep(.el-button__icon) {
  margin-right: 8px;
}

:deep(.el-button) svg {
  width: 18px;
  height: 18px;
}

/* Status Message */
.status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.status svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.status.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: var(--color-green);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
  color: var(--color-red);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status.info {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  color: var(--color-primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.el-divider--horizontal{
  border-top: none;
}
/* Presets Section */
.presets-section {
  margin-top: 20px;
  padding-top: 10px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  margin-bottom: 20px;
}

.presets-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

:deep(.el-divider) {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 28px 0;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.divider-icon {
  width: 24px;
  height: 24px;
}

.preset-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.preset-save {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.06) 100%);
  border-radius: 16px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

/* Preset Select/Input Styling */
:deep(.preset-actions .el-select),
:deep(.preset-save .el-input) {
  flex: 1;
}

:deep(.preset-actions .el-select__wrapper),
:deep(.preset-save .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
  height: 44px;
}

:deep(.preset-actions .el-select__wrapper:hover),
:deep(.preset-save .el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(99, 102, 241, 0.4);
}

:deep(.preset-actions .el-select__wrapper.is-focused),
:deep(.preset-save .el-input__wrapper.is-focused) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

:deep(.preset-actions .el-button),
:deep(.preset-save .el-button) {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* Form Item Overrides */
:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  color: var(--text-dim);
  font-size: 13px;
  font-weight: 600;
  padding: 0;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Tab Switcher */
.tab-switcher {
  display: flex;
  gap: 8px;
  padding: 0 40px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-dim);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-normal);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

.tab-content {
  width: 100%;
}
</style>
