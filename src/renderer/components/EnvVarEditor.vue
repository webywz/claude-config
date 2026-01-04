<template>
  <div class="path-editor">
    <div class="path-header">
      <div class="header-content">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="url(#pathGradient)" stroke-width="2"/>
          <path d="M7 8H17M7 12H13M7 16H11" stroke="url(#pathGradient)" stroke-width="2" stroke-linecap="round"/>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#667eea"/>
              <stop offset="100%" stop-color="#764ba2"/>
            </linearGradient>
          </defs>
        </svg>
        <h3 class="header-title">Windows Path 环境变量</h3>
      </div>
      <div class="header-actions">
        <el-select v-model="filterType" placeholder="筛选" size="small" style="width: 100px">
          <el-option label="全部" value="all" />
          <el-option label="用户" value="user" />
          <el-option label="系统" value="system" />
        </el-select>
        <button type="button" class="add-btn" @click="showAddDialog = true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          添加
        </button>
      </div>
    </div>

    <!-- Add path dialog -->
    <el-dialog v-model="showAddDialog" title="添加路径" width="500px">
      <el-form label-position="top">
        <el-form-item label="路径">
          <el-input
            v-model="newPathInput"
            placeholder="输入路径，如: C:\Program Files\MyApp"
            @keyup.enter="addPath"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addPath">添加</el-button>
      </template>
    </el-dialog>

    <div class="path-list">
      <transition-group name="list">
        <div
          v-for="(pathItem, index) in filteredPaths"
          :key="`${pathItem.value}-${pathItem.type}`"
          class="path-item"
          :class="{ 'is-system': pathItem.type === 'system' }"
        >
          <div class="path-display">
            <div class="path-info">
              <span class="path-type" :class="pathItem.type">{{ pathItem.type === 'user' ? '用户' : '系统' }}</span>
              <span class="path-value" :title="pathItem.value">{{ pathItem.value }}</span>
            </div>
            <div class="path-actions">
              <button
                v-if="pathItem.type === 'user' && getUserIndex(index) > 0"
                type="button"
                class="action-btn move-up"
                @click="movePath(getUserIndex(index), -1)"
                title="上移"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                v-if="pathItem.type === 'user' && getUserIndex(index) < userPathCount - 1"
                type="button"
                class="action-btn move-down"
                @click="movePath(getUserIndex(index), 1)"
                title="下移"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M19 12L12 19L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                v-if="pathItem.type === 'user'"
                type="button"
                class="action-btn delete"
                @click="deletePath(pathItem.value)"
                title="删除"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                v-else
                type="button"
                class="action-btn readonly"
                title="系统路径只读"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L8 11H11V4H13V11H16L12 15ZM4 20H20V18H4V20Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition-group>

      <div v-if="filteredPaths.length === 0 && !loading" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 8H13M7 12H11M7 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>暂无路径</p>
      </div>
    </div>

    <div v-if="systemMessage" class="system-message" :class="systemMessage.type">
      {{ systemMessage.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { PathEntry } from '@/types/config.types'

const paths = ref<PathEntry[]>([])
const loading = ref(false)
const filterType = ref<'all' | 'user' | 'system'>('all')
const showAddDialog = ref(false)
const newPathInput = ref('')
const systemMessage = ref<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

const filteredPaths = computed(() => {
  let result = paths.value
  if (filterType.value !== 'all') {
    result = result.filter(p => p.type === filterType.value)
  }
  return result
})

const userPathCount = computed(() => {
  return paths.value.filter(p => p.type === 'user').length
})

function getUserIndex(overallIndex: number): number {
  // Get the index within user paths only
  const userPaths = paths.value.filter(p => p.type === 'user')
  const item = filteredPaths.value[overallIndex]
  if (item.type !== 'user') return -1
  return userPaths.findIndex(p => p.value === item.value)
}

async function loadPaths() {
  loading.value = true
  try {
    paths.value = await window.electronAPI.system.getPaths()
  } catch (error) {
    console.error('Failed to load paths:', error)
    showSystemMessage('加载路径失败', 'error')
  } finally {
    loading.value = false
  }
}

async function addPath() {
  const pathValue = newPathInput.value.trim()
  if (!pathValue) {
    ElMessage.error('路径不能为空')
    return
  }

  // Check for duplicates
  const exists = paths.value.some(p => p.value.toLowerCase() === pathValue.toLowerCase())
  if (exists) {
    ElMessage.error('该路径已存在')
    return
  }

  try {
    const success = await window.electronAPI.system.addPath(pathValue)
    if (success) {
      showSystemMessage('路径已添加', 'success')
      // Add to local state
      paths.value.push({ value: pathValue, type: 'user' })
      showAddDialog.value = false
      newPathInput.value = ''
    } else {
      showSystemMessage('添加失败，路径可能已存在', 'error')
    }
  } catch (error) {
    showSystemMessage('添加失败: ' + (error instanceof Error ? error.message : '未知错误'), 'error')
  }
}

async function deletePath(pathValue: string) {
  try {
    await ElMessageBox.confirm(`确定要删除路径 "${pathValue}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const success = await window.electronAPI.system.removePath(pathValue)
    if (success) {
      showSystemMessage('路径已删除', 'success')
      // Remove from local state
      const index = paths.value.findIndex(p => p.value === pathValue)
      if (index !== -1) {
        paths.value.splice(index, 1)
      }
    } else {
      showSystemMessage('删除失败', 'error')
    }
  } catch (error) {
    if (error !== 'cancel') {
      showSystemMessage('删除失败: ' + (error instanceof Error ? error.message : '未知错误'), 'error')
    }
  }
}

async function movePath(userIndex: number, direction: number) {
  const toIndex = userIndex + direction
  try {
    const success = await window.electronAPI.system.movePath(userIndex, toIndex)
    if (success) {
      showSystemMessage('路径顺序已更新', 'success')
      await loadPaths() // Reload to get correct order
    } else {
      showSystemMessage('移动失败', 'error')
    }
  } catch (error) {
    showSystemMessage('移动失败: ' + (error instanceof Error ? error.message : '未知错误'), 'error')
  }
}

function showSystemMessage(text: string, type: 'success' | 'error' | 'info') {
  systemMessage.value = { text, type }
  setTimeout(() => {
    systemMessage.value = null
  }, 3000)
}

onMounted(() => {
  loadPaths()
})
</script>

<style scoped>
.path-editor {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  width: 100%;
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-btn:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  transform: translateY(-1px);
}

.add-btn svg {
  width: 14px;
  height: 14px;
}

.path-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.path-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  /* overflow: hidden; */
  transition: all 0.2s ease;
}

.path-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(99, 102, 241, 0.3);
}

.path-item.is-system {
  background: rgba(107, 114, 128, 0.05);
}

.path-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  gap: 8px;
}

.path-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.path-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.path-type.user {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-green);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.path-type.system {
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-dim);
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.path-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 12px;
  color: var(--text-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.path-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn.move-up:hover,
.action-btn.move-down:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-red);
}

.action-btn.readonly {
  cursor: not-allowed;
  opacity: 0.5;
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

.system-message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.system-message.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: var(--color-green);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.system-message.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
  color: var(--color-red);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.system-message.info {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  color: var(--color-primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
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

/* Responsive */
@media (max-width: 600px) {
  .path-display {
    flex-wrap: wrap;
  }

  .path-info {
    flex-basis: 100%;
    margin-bottom: 4px;
  }

  .path-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
