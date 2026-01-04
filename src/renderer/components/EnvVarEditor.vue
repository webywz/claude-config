<template>
  <div class="env-var-editor">
    <div class="env-header">
      <div class="header-content">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="url(#envGradient)" stroke-width="2"/>
          <path d="M7 8H13M7 12H11M7 16H10" stroke="url(#envGradient)" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 11L18 13L22 9" stroke="url(#envGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="envGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#667eea"/>
              <stop offset="100%" stop-color="#764ba2"/>
            </linearGradient>
          </defs>
        </svg>
        <h3 class="header-title">环境变量</h3>
      </div>
      <button class="add-btn" @click="addNewVar">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        添加变量
      </button>
    </div>

    <div class="env-list">
      <transition-group name="list">
        <div
          v-for="(varItem, index) in envVars"
          :key="varItem.id"
          class="env-item"
          :class="{ editing: varItem.isEditing }"
        >
          <div v-if="!varItem.isEditing" class="env-display">
            <div class="env-info">
              <span class="env-key">{{ varItem.key }}</span>
              <span class="env-value">{{ maskValue(varItem.value) }}</span>
            </div>
            <div class="env-actions">
              <button class="action-btn edit" @click="editVar(index)" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="action-btn delete" @click="deleteVar(index)" title="删除">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="env-edit">
            <div class="edit-inputs">
              <el-input
                v-model="varItem.key"
                placeholder="变量名"
                class="key-input"
                @keyup.enter="saveVar(index)"
              />
              <el-input
                v-model="varItem.value"
                placeholder="变量值"
                type="password"
                show-password
                class="value-input"
                @keyup.enter="saveVar(index)"
              />
            </div>
            <div class="edit-actions">
              <button class="action-btn save" @click="saveVar(index)" title="保存">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="action-btn cancel" @click="cancelEdit(index)" title="取消">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition-group>

      <div v-if="envVars.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 8H13M7 12H11M7 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>暂无自定义环境变量</p>
        <p class="empty-hint">点击上方"添加变量"按钮添加</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface EnvVar {
  id: string
  key: string
  value: string
  originalKey?: string
  isEditing: boolean
}

interface EnvObject {
  [key: string]: string | undefined
}

// Reserved environment variables that shouldn't be edited here
const RESERVED_KEYS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'DISABLE_TELEMETRY',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC',
  'OTEL_METRICS_EXPORTER'
]

const props = defineProps<{
  env: EnvObject
}>()

const emit = defineEmits<{
  'update:env': [value: EnvObject]
}>()

const envVars = ref<EnvVar[]>([])
let idCounter = 0

// Initialize from props
function initFromProps() {
  const vars: EnvVar[] = []
  for (const [key, value] of Object.entries(props.env)) {
    if (value !== undefined && !RESERVED_KEYS.includes(key)) {
      vars.push({
        id: String(idCounter++),
        key,
        value,
        isEditing: false
      })
    }
  }
  envVars.value = vars
}

initFromProps()

function generateId(): string {
  return String(idCounter++)
}

function maskValue(value: string): string {
  if (!value) return ''
  if (value.length <= 8) return '•'.repeat(value.length)
  return value.substring(0, 4) + '•'.repeat(value.length - 8) + value.substring(value.length - 4)
}

function addNewVar() {
  envVars.value.push({
    id: generateId(),
    key: '',
    value: '',
    isEditing: true
  })
}

function editVar(index: number) {
  const item = envVars.value[index]
  item.originalKey = item.key
  item.isEditing = true
}

function saveVar(index: number) {
  const item = envVars.value[index]

  if (!item.key.trim()) {
    ElMessage.error('变量名不能为空')
    return
  }

  // Check for duplicate keys (excluding current item when editing)
  const duplicate = envVars.value.find((v, i) => i !== index && v.key === item.key)
  if (duplicate) {
    ElMessage.error(`变量名 "${item.key}" 已存在`)
    return
  }

  // Check if key is reserved
  if (RESERVED_KEYS.includes(item.key)) {
    ElMessage.error(`"${item.key}" 是保留变量名，请在主配置区域设置`)
    return
  }

  item.isEditing = false
  delete item.originalKey
  emitChange()
}

function cancelEdit(index: number) {
  const item = envVars.value[index]

  // If it was a new item (no original key), remove it
  if (!item.originalKey && !item.key) {
    envVars.value.splice(index, 1)
  } else {
    // Restore original key
    item.key = item.originalKey || item.key
    item.isEditing = false
    delete item.originalKey
  }
}

function deleteVar(index: number) {
  envVars.value.splice(index, 1)
  emitChange()
}

function emitChange() {
  const newEnv: EnvObject = {}

  // Keep all original env values
  for (const [key, value] of Object.entries(props.env)) {
    newEnv[key] = value
  }

  // Remove old custom env values
  for (const item of envVars.value) {
    if (!item.isEditing) {
      // Remove the old key if it was renamed
      if (item.originalKey && item.originalKey !== item.key) {
        delete newEnv[item.originalKey]
      }
    }
  }

  // Add current custom env values
  for (const item of envVars.value) {
    if (!item.isEditing && item.key) {
      newEnv[item.key] = item.value || undefined
    }
  }

  emit('update:env', newEnv)
}

// Watch for external changes
watch(
  () => props.env,
  () => {
    // Only reinitialize if the keys have changed significantly
    const currentKeys = new Set(Object.keys(props.env).filter(k => !RESERVED_KEYS.includes(k)))
    const localKeys = new Set(envVars.value.filter(v => !v.isEditing).map(v => v.key))

    if (currentKeys.size !== localKeys.size || ![...currentKeys].every(k => localKeys.has(k))) {
      // Save current editing state
      const editingStates = new Set(envVars.value.filter(v => v.isEditing).map(v => v.id))

      // Reinitialize
      initFromProps()

      // Restore editing states for items that still exist
      // (this is a simplified approach - in production you'd want more sophisticated handling)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.env-var-editor {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.env-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 24px;
  height: 24px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  transform: translateY(-1px);
}

.add-btn svg {
  width: 16px;
  height: 16px;
}

.env-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100px;
}

.env-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.env-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(99, 102, 241, 0.3);
}

.env-item.editing {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.4);
}

.env-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.env-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.env-key {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}

.env-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 12px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.env-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
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

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.edit:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-red);
}

.action-btn.save {
  color: var(--color-green);
}

.action-btn.save:hover {
  background: rgba(16, 185, 129, 0.1);
}

.action-btn.cancel:hover {
  background: rgba(107, 114, 128, 0.1);
}

.env-edit {
  padding: 12px 16px;
}

.edit-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.edit-inputs :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  box-shadow: none;
}

.key-input {
  flex: 1;
  min-width: 150px;
}

.value-input {
  flex: 2;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-dim);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
