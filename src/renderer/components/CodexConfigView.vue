<template>
  <div class="codex-config-view">
    <!-- Config Paths -->
    <div class="path-display">
      <div class="path-row">
        <svg class="path-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 6.79086 19.2091 5 17 5H11C9.34315 5 8 6.34315 8 8V9" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span class="path-label">配置文件 (config)</span>
        <span class="path-text">{{ configPath || '加载中...' }}</span>
      </div>
      <div class="path-row">
        <svg class="path-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V10L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M12 3V10H19" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span class="path-label">认证文件 (auth)</span>
        <span class="path-text">{{ authPath || '加载中...' }}</span>
      </div>
    </div>

    <!-- config.toml Raw View -->
    <div class="raw-toml" data-animate="0.5">
      <div class="raw-header">
        <div class="raw-title">config.toml 预览</div>
        <el-button size="small" @click="refreshConfigRaw">刷新内容</el-button>
      </div>
      <el-input
        :model-value="configRaw"
        type="textarea"
        :rows="7"
        readonly
        placeholder="(尚未找到 config.toml)"
      />
    </div>

    <!-- Smart Suggestion Banner -->
    <transition name="slide-fade">
      <div v-if="smartSuggestion" class="smart-suggestion">
        <div class="suggestion-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
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

    <!-- Main Configuration Form -->
    <el-form label-position="top" class="config-form">
      <!-- Active Provider Selection -->
      <div class="form-group" data-animate="1">
        <el-form-item label="活跃模型提供商">
          <el-select v-model="activeProviderValue" placeholder="请选择提供商...">
            <el-option
              v-for="provider in providerConfigs"
              :key="provider"
              :label="provider"
              :value="provider"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Model Settings -->
      <div class="form-group" data-animate="1.5">
        <el-form-item label="默认模型 (model)">
          <el-input
            :model-value="config.model || ''"
            placeholder="例如: gpt-4, gpt-5.2"
            @input="codexStore.setModel($event)"
          />
        </el-form-item>

        <el-form-item label="推理强度 (reasoning_effort)">
          <el-select
            :model-value="config.model_reasoning_effort || ''"
            placeholder="选择推理强度"
            @change="codexStore.setModelReasoningEffort($event)"
          >
            <el-option label="低 (low)" value="low" />
            <el-option label="中 (medium)" value="medium" />
            <el-option label="高 (high)" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="响应存储设置">
           <div class="switch-container">
             <span class="switch-label">如果不希望本地存储响应数据，请开启此选项。</span>
             <el-switch
                :model-value="!!config.disable_response_storage"
                active-text="禁用响应存储"
                @change="codexStore.setDisableResponseStorage($event)"
             />
           </div>
        </el-form-item>
      </div>

      <!-- Provider Configuration -->
      <div class="form-group" data-animate="2">
        <div class="section-header">
          <h3>提供商配置</h3>
          <el-button type="primary" size="small" @click="showAddProviderDialog = true">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </template>
            添加提供商
          </el-button>
        </div>

        <div class="provider-list">
          <div
            v-for="(providerConfig, providerName) in (config.model_providers || {})"
            :key="providerName"
            class="provider-card"
            :class="{ active: providerName === activeProviderValue }"
          >
            <div class="provider-header">
              <div class="provider-name">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ providerName }}
                <span v-if="providerName === activeProviderValue" class="active-badge">当前活跃</span>
              </div>
              <el-button
                v-if="providerName !== activeProviderValue"
                type="danger"
                size="small"
                text
                @click="handleRemoveProvider(providerName)"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </el-button>
            </div>

            <div class="provider-fields">
              <!-- API Base -->
              <el-form-item :label="`接口地址 (${providerName})`">
                <el-input
                  :model-value="providerConfig.base_url || ''"
                  placeholder="https://api.example.com"
                  @input="handleProviderFieldChange(providerName, 'base_url', $event)"
                />
              </el-form-item>

            </div>
          </div>
        </div>
      </div>

      <!-- Authentication Keys -->
      <div class="form-group" data-animate="3">
        <div class="section-header">
          <h3>API 密钥配置 (auth.json)</h3>
        </div>
        <div class="auth-keys-editor">
          <div
            v-for="(keyValue, keyName) in auth"
            :key="keyName"
            class="auth-key-item"
          >
            <div class="auth-key-label">{{ keyName }}</div>
            <el-input
              v-model="auth[keyName]"
              type="password"
              show-password
              placeholder="请输入 API Key..."
            />
            <el-button
              type="danger"
              size="small"
              text
              @click="handleRemoveAuthKey(keyName)"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-group button-group" data-animate="4">
        <el-button type="primary" size="large" @click="handleSaveConfig" :loading="savingConfig">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3L5 12.5L9 15L15.5 9L21 3V21H17V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </template>
          {{ savingConfig ? '正在保存...' : '保存主要配置' }}
        </el-button>
        <el-button type="success" size="large" @click="handleSaveAuth" :loading="savingAuth">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
          {{ savingAuth ? '保存中...' : '保存 API Keys' }}
        </el-button>
        <el-button type="info" size="large" @click="handleOpenFolder">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 6.79086 19.2091 5 17 5H11C9.34315 5 8 6.34315 8 8V9" stroke="currentColor" stroke-width="2"/>
            </svg>
          </template>
          打开配置目录
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
          {{ statusMessage.text }}
        </div>
      </transition>
    </el-form>

    <!-- Presets -->
    <div class="presets-section" data-animate="4.5">
      <div class="section-header">
        <h3>多环境预设</h3>
      </div>

      <div class="preset-actions">
        <el-select v-model="selectedPreset" placeholder="选择预设..." style="width: 220px" filterable>
          <el-option v-for="name in presetNames" :key="name" :label="name" :value="name" />
        </el-select>
        <el-button type="primary" :disabled="!selectedPreset" @click="handleApplyPreset">
          应用
        </el-button>
        <el-button type="danger" :disabled="!selectedPreset" @click="handleDeletePreset">
          删除
        </el-button>
      </div>

      <div class="preset-save">
        <el-input v-model="newPresetName" placeholder="输入新预设名称..." style="width: 220px" />
        <el-button type="success" :disabled="!newPresetName" @click="handleSavePreset">
          保存当前为预设
        </el-button>
      </div>
    </div>

    <!-- Add Provider Dialog -->
    <el-dialog v-model="showAddProviderDialog" title="添加提供商" width="400px" class="glass-dialog">
      <el-form label-position="top">
        <el-form-item label="提供商名称 (Provider Name)">
          <el-input
            v-model="newProviderName"
            placeholder="例如: openai, anthropic, fox"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddProviderDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddProvider">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCodexStore } from '@/stores/codex.store'

const codexStore = useCodexStore()

const config = computed(() => codexStore.config)
const auth = computed(() => codexStore.auth)
const configPath = computed(() => codexStore.configPath)
const authPath = computed(() => codexStore.authPath)
const configRaw = computed(() => codexStore.configRaw)
const statusMessage = computed(() => codexStore.statusMessage)
const providerConfigs = computed(() => Object.keys(codexStore.config.model_providers || {}))
const loading = computed(() => codexStore.loading)
const presetNames = computed(() => codexStore.presetNames)

const activeProviderValue = ref('')
const savingConfig = ref(false)
const savingAuth = ref(false)
const smartSuggestion = ref('')
const showAddProviderDialog = ref(false)
const newProviderName = ref('')
const newAuthKeyName = ref('')
const selectedPreset = ref('')
const newPresetName = ref('')

onMounted(async () => {
  activeProviderValue.value = codexStore.activeProvider

  setTimeout(() => {
    const providers = config.value.model_providers || {}
    if (Object.keys(providers).length === 0) {
      smartSuggestion.value = '建议先添加一个模型提供商配置，例如 openai'
    }
  }, 1000)

  animateElements()
})

watch(statusMessage, () => {
  if (statusMessage.value) {
    setTimeout(() => {
      codexStore.clearStatus()
    }, 3000)
  }
})

watch(activeProviderValue, (newVal) => {
  if (newVal && newVal !== codexStore.activeProvider) {
    codexStore.setActiveProvider(newVal)
  }
})

watch(
  () => codexStore.activeProvider,
  (newVal) => {
    if (newVal && newVal !== activeProviderValue.value) {
      activeProviderValue.value = newVal
    }
  }
)

function animateElements() {
  const elements = document.querySelectorAll('[data-animate]')
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animate-in')
    }, index * 100)
  })
}

function handleProviderFieldChange(provider: string, field: string, value: string) {
  codexStore.updateProviderConfig(provider, field, value)
}

async function handleAddProvider() {
  const name = newProviderName.value.trim().toLowerCase()
  if (!name) {
    ElMessage.error('请输入提供商名称')
    return
  }

  const providers = config.value.model_providers || {}
  if (providers[name]) {
    ElMessage.error('该提供商已存在')
    return
  }

  codexStore.addProvider(name)
  ElMessage.success(`已添加提供商 "${name}"`)
  showAddProviderDialog.value = false
  newProviderName.value = ''
  smartSuggestion.value = `已添加提供商 "${name}"，请在下方配置其接口地址`
}

async function handleRemoveProvider(name: string) {
  try {
    await ElMessageBox.confirm(`确定移除提供商 "${name}" 吗？`, '确认', {
      confirmButtonText: '移除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    codexStore.removeProvider(name)
    ElMessage.success(`已移除提供商 "${name}"`)
  } catch {
    // User cancelled
  }
}

function handleRemoveAuthKey(name: string) {
  codexStore.updateAuthKey(name, '')
  delete auth.value[name]
  ElMessage.success('已移除 API Key')
}

async function handleSaveConfig() {
  savingConfig.value = true
  await codexStore.saveConfig()
  savingConfig.value = false

  if (statusMessage.value?.type === 'success') {
    smartSuggestion.value = '主配置已保存！如果修改了 Key，别忘了也保存 API Keys'
  }
}

async function handleSaveAuth() {
  savingAuth.value = true
  await codexStore.saveAuth()
  savingAuth.value = false

  if (statusMessage.value?.type === 'success') {
    smartSuggestion.value = 'API Keys 已保存！'
  }
}

async function handleOpenFolder() {
  await codexStore.openFolder()
}

async function refreshConfigRaw() {
  await codexStore.loadConfigRaw()
}

async function handleApplyPreset() {
  if (!selectedPreset.value) {
    ElMessage.error('请先选择预设')
    return
  }

  const name = selectedPreset.value
  const success = await codexStore.applyPreset(name)
  if (success) {
    ElMessage.success(`已应用预设 "${name}"`)
    selectedPreset.value = ''
  } else {
    ElMessage.error('应用预设失败')
  }
}

async function handleDeletePreset() {
  if (!selectedPreset.value) {
    ElMessage.error('请先选择预设')
    return
  }

  const name = selectedPreset.value
  const success = await codexStore.deletePreset(name)
  if (success) {
    ElMessage.success(`已删除预设 "${name}"`)
    selectedPreset.value = ''
  } else {
    ElMessage.error('删除预设失败')
  }
}

async function handleSavePreset() {
  const name = newPresetName.value.trim()
  if (!name) {
    ElMessage.error('请输入预设名称')
    return
  }

  const success = await codexStore.savePreset(name)
  if (success) {
    ElMessage.success(`已保存预设 "${name}"`)
    newPresetName.value = ''
  } else {
    ElMessage.error('保存预设失败')
  }
}
</script>

<style scoped>
.codex-config-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.path-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.path-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.path-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}

.path-label {
  width: 90px;
  flex-shrink: 0;
  color: var(--text-primary);
  opacity: 0.85;
  font-weight: 600;
}

.path-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Raw TOML Viewer */
.raw-toml {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.raw-toml.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.raw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.raw-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

/* Smart Suggestion */
.smart-suggestion {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--gradient-primary, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 2px;
}

.suggestion-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.suggestion-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

.switch-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.switch-label {
    font-size: 13px;
    color: var(--text-secondary);
}

/* Presets */
.presets-section {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.presets-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.preset-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.preset-save {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  background: var(--gradient-primary, linear-gradient(135deg, #626aef, #a0cfff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Provider List */
.provider-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.provider-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.provider-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(99, 102, 241, 0.3);
}

.provider-card.active {
  border-color: var(--accent-primary, #646cff);
  background: rgba(100, 108, 255, 0.05);
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.provider-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.provider-name svg {
  width: 18px;
  height: 18px;
}

.active-badge {
  padding: 2px 8px;
  background: var(--accent-primary, #646cff);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.provider-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Auth Keys Editor */
.auth-keys-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-key-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-key-label {
  min-width: 180px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
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

/* Status */
.status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

/* Force dark inputs in this view */
:deep(.el-input__wrapper) {
    background-color: rgba(0,0,0,0.3) !important;
}
:deep(.el-input__inner) {
    color: #F8FAFC !important;
}
</style>
