<template>
  <div class="skills-view">
    <!-- Header Actions -->
    <div class="actions-header" data-animate="1">
      <div class="header-left">
        <h2>技能库管理</h2>
        <p class="subtitle">同步各个 AI 工具的 Skills 配置</p>
      </div>
      <div class="header-right">
        <el-button color="#646cff" :dark="true" @click="handleImportClick">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 11L12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </template>
          导入技能 (Zip/文件夹)
        </el-button>
        <el-button type="primary" :loading="syncing" @click="handleSyncAll" class="sync-btn">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="rotate-icon" :class="{ spinning: syncing }">
              <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12M4 12H2M20 12H22M12 4V2M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 8L12 16M8 12L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </template>
          同步所有
        </el-button>
        <el-button @click="handleScan" :loading="loading" circle plain>
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              <path d="M16 12L12 16L8 12M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </el-button>
      </div>
    </div>
    
    <!-- Hidden File Input for Import -->
    <input 
      type="file" 
      ref="fileInput" 
      style="display: none" 
      @change="handleFileSelected" 
      multiple
      accept=".zip"
    />

    <!-- Provider Paths Info -->
    <div class="provider-paths" data-animate="2">
      <div v-for="(path, provider) in paths" :key="provider" class="path-card glass-panel" @click="handleOpenPath(path)">
        <div class="path-header">
            <span class="provider-icon" :class="provider"></span>
            <span class="provider-name">{{ capitalize(provider) }}</span>
        </div>
        <div class="path-value" :title="path">{{ path ? path.split(/[/\\]/).pop() : '未配置' }}</div>
        <div class="path-full-value">{{ path || '未配置' }}</div>
      </div>
    </div>

    <!-- Skills Matrix Table -->
    <div class="skills-matrix glass-panel" data-animate="3" v-loading="loading">
      <el-table :data="tableData" style="width: 100%" height="calc(100vh - 400px)" :header-cell-style="{ background: 'transparent' }" :row-style="{ background: 'transparent' }">
        <el-table-column prop="name" label="技能名称" min-width="180" sortable>
          <template #default="{ row }">
            <div class="skill-name-cell">
              <div class="skill-icon-wrapper">
                <span class="skill-icon">🧩</span>
              </div>
              <div>
                <div class="skill-name">{{ row.name }}</div>
                <div class="skill-provider-source" v-if="row.source">
                    来源: <span :class="['source-tag', row.source]">{{ capitalize(row.source) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column v-for="provider in providerList" :key="provider" :label="capitalize(provider)" align="center" width="100">
          <template #default="{ row }">
            <div class="status-cell">
              <div v-if="row.providers[provider]" class="status-dot success"></div>
              <div v-else class="status-dot missing"></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="80" fixed="right">
          <template #default="{ row }">
             <el-button type="danger" circle size="small" @click.stop="handleDelete(row.name)" class="delete-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6H21" stroke-linecap="round"/>
                  <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6"/>
                  <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"/>
                </svg>
             </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Create Skill Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建 Skill" width="500px" class="glass-dialog">
      <el-form label-position="top">
        <el-form-item label="技能名称" required>
          <el-input v-model="newSkill.name" placeholder="例如: python-utils" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newSkill.description" type="textarea" :rows="3" placeholder="简要描述此 Skill 的功能..." />
        </el-form-item>
        <el-form-item label="部署目标" required>
          <div class="provider-checkboxes">
             <el-checkbox-group v-model="newSkill.providers">
                <el-checkbox v-for="p in providerList" :key="p" :label="p" border>{{ capitalize(p) }}</el-checkbox>
             </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button color="#646cff" :loading="creating" @click="handleCreate" :disabled="!isFormValid">
            立即创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Import Skill Dialog (Simple Provider Selection) -->
    <el-dialog v-model="showImportDialog" title="导入技能" width="450px" class="glass-dialog">
        <p class="dialog-subtitle">选择要将技能导入到的目标平台：</p>
        <div class="provider-checkboxes">
            <el-checkbox-group v-model="importTargetProviders">
               <el-checkbox v-for="p in providerList" :key="p" :label="p" border>{{ capitalize(p) }}</el-checkbox>
            </el-checkbox-group>
         </div>
         <div class="import-drop-zone" 
              @drop.prevent="handleDrop" 
              @dragover.prevent="dragOver = true" 
              @dragleave.prevent="dragOver = false"
              :class="{ 'is-dragover': dragOver }">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>拖拽文件到这里</p>
            <div class="import-actions">
                <el-button type="primary" size="small" @click="triggerFileInput('file')">选择 Zip 文件</el-button>
                <el-button size="small" @click="triggerFileInput('dir')">选择文件夹</el-button>
            </div>
         </div>
    </el-dialog>

    <!-- Status Message -->
    <transition name="slide-up">
      <div v-if="statusMessage" :class="['status-toast', statusMessage.type]">
        <div class="toast-icon">
            <svg v-if="statusMessage.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        {{ statusMessage.text }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useSkillsStore } from '../stores/skills.store'
import type { SkillProvider } from '../../../electron/config/types'

const store = useSkillsStore()
const providerList: SkillProvider[] = ['claude', 'codex', 'gemini', 'antigravity', 'trae']

const loading = computed(() => store.loading)
const syncing = computed(() => store.syncing)
const paths = computed(() => store.paths)
const statusMessage = computed(() => store.statusMessage)

// Creating State
const showCreateDialog = ref(false)
const creating = ref(false)
const newSkill = reactive({
  name: '',
  description: '',
  providers: ['claude'] as SkillProvider[]
})

// Import State
const showImportDialog = ref(false)
const importTargetProviders = ref<SkillProvider[]>(['claude'])
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const isFormValid = computed(() => {
  return newSkill.name && newSkill.providers.length > 0
})

const tableData = computed(() => {
  return store.allSkills.map(skillName => {
    const row = {
      name: skillName,
      source: '',
      providers: {} as Record<string, boolean>
    }

    providerList.forEach(p => {
        const hasSkill = store.providers[p].some(s => s.name === skillName)
        row.providers[p] = hasSkill
        if (hasSkill && !row.source) row.source = p
    })
    return row
  })
})

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function handleScan() {
  store.scan()
}

function handleSyncAll() {
  store.sync('all')
}

function handleOpenPath(path: string) {
  if (path) {
    window.electronAPI.system.openPath(path)
  }
}

async function handleCreate() {
  creating.value = true
  const success = await store.create({
    name: newSkill.name,
    description: newSkill.description,
    providers: newSkill.providers
  })
  creating.value = false
  if (success) {
    showCreateDialog.value = false
    // Reset form
    newSkill.name = ''
    newSkill.description = ''
    newSkill.providers = ['claude']
  }
}

function handleDelete(name: string) {
  store.deleteSkill(name)
}

// Import Logic
async function handleImportClick() {
    showImportDialog.value = true
}

async function triggerFileInput(mode: 'file' | 'dir' = 'file') {
    // Legacy file input trigger
    // Use native dialog if possible, else fallback
    try {
        if (!window.electronAPI?.system?.showOpenDialog) {
            throw new Error('API not available: system.showOpenDialog')
        }

        const properties: ('openFile' | 'openDirectory')[] = mode === 'dir' ? ['openDirectory'] : ['openFile']
        
        const result = await window.electronAPI.system.showOpenDialog({
            properties: properties,
            filters: [
                { name: 'Skills', extensions: ['zip', 'md'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0]
            const success = await store.importSkill(filePath, [...importTargetProviders.value])
            if (success) {
                showImportDialog.value = false
            }
        }
    } catch (e) {
        console.error('Dialog failed, using fallback input', e)
        const errorMessage = e instanceof Error ? e.message : String(e)
        // store.statusMessage = { type: 'error', text: `Dialog failed: ${errorMessage}. Trying fallback...` }
        
        // Fallback (Only supports file selection adequately)
        if (mode === 'file') {
             fileInput.value?.click()
        } else {
             store.statusMessage = { type: 'error', text: '文件夹选择需要原生 API 支持' }
        }
    }
}

async function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
        await processImport(files[0])
    }
    // Reset input
    target.value = ''
}

async function handleDrop(event: DragEvent) {
    dragOver.value = false
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
        await processImport(files[0])
    }
}

async function processImport(file: File) {
    // Use webUtils to get the path
    let filePath = ''
    try {
        if (window.electronAPI.webUtils) {
            filePath = window.electronAPI.webUtils.getPathForFile(file)
        } else {
             // Fallback for older electron / direct exposure
            filePath = (file as any).path
        }
    } catch (e) {
        console.error('Failed to get path', e)
        filePath = (file as any).path
    }

    if (filePath) {
        const success = await store.importSkill(filePath, [...importTargetProviders.value])
        if (success) {
            showImportDialog.value = false
        }
    } else {
        console.error('Cannot determine file path for import')
        const apiStatus = window.electronAPI.webUtils ? 'Active' : 'Missing'
        store.statusMessage = { type: 'error', text: `无法读取路径 (API: ${apiStatus}). 请检查控制台日志。` }
    }
}


onMounted(() => {
  store.scan()
  
  // Simple Animation logic
  setTimeout(() => {
    document.querySelectorAll('[data-animate]').forEach((el, i) => {
      setTimeout(() => el.classList.add('animate-in'), i * 100)
    })
  }, 100)
})
</script>

<style scoped>
.skills-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-left h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: var(--gradient-primary, linear-gradient(135deg, #626aef, #a0cfff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Glass Panel Styles */
.glass-panel {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.provider-paths {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.path-card {
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.path-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.path-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: rgba(98, 106, 239, 0.3);
}

.path-card:hover::before {
  opacity: 1;
}

.path-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.provider-name {
  font-weight: 600;
  font-size: 14px;
}

.path-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.path-full-value {
    font-size: 10px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    opacity: 0.6;
}

.provider-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}
.provider-icon.claude { background: #d97757; color: #d97757; }
.provider-icon.codex { background: #10a37f; color: #10a37f; }
.provider-icon.gemini { background: #4b90ff; color: #4b90ff; }
.provider-icon.antigravity { background: #8e24aa; color: #8e24aa; }
.provider-icon.trae { background: #ff9800; color: #ff9800; }

.skills-matrix {
  flex: 1;
  padding: 4px;
  display: flex;
  flex-direction: column;
}

/* Table Styling */
.skill-name-cell {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.skill-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(98, 106, 239, 0.1) 0%, rgba(98, 106, 239, 0.05) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(98, 106, 239, 0.1);
}

.skill-icon {
  font-size: 20px;
}

.skill-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.skill-provider-source {
  font-size: 11px;
  color: var(--text-secondary);
}

.source-tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    font-weight: 500;
}
.source-tag.claude { color: #d97757; background: rgba(217, 119, 87, 0.1); }
.source-tag.codex { color: #10a37f; background: rgba(16, 163, 127, 0.1); }

.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: all 0.3s ease;
}
.status-dot.success {
    background: #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}
.status-dot.missing {
    background: var(--border-color);
    width: 6px;
    height: 6px;
    opacity: 0.3;
}

.delete-btn {
    opacity: 0;
    transition: all 0.2s ease;
    transform: scale(0.8);
}
.el-table__row:hover .delete-btn {
    opacity: 1;
    transform: scale(1);
}

/* Dialog Styles */
.dialog-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.provider-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.import-drop-zone {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
    transition: all 0.2s ease;
    margin-top: 20px;
    background: rgba(0,0,0,0.1);
}
.import-drop-zone:hover, .import-drop-zone.is-dragover {
    border-color: #646cff;
    background: rgba(100, 108, 255, 0.05);
}
.import-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
}
.upload-icon {
    margin-bottom: 10px;
    color: var(--text-secondary);
}

/* Status Toast */
.status-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  background: rgba(30, 30, 35, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-toast.success { color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
.status-toast.error { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }

/* Animation Utils */
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-animate].animate-in {
  opacity: 1;
  transform: translateY(0);
}

.spinning {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
