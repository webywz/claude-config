<template>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <img class="app-logo" :src="logoUrl" alt="AI 智控中心" />
        </div>
        <div class="app-title">
          <h1>AI 智控中心</h1>
          <span class="version-tag">v1.0</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <div class="nav-icon" v-html="tab.icon"></div>
          <span class="nav-label">{{ tab.label }}</span>
          <div class="active-indicator" v-if="activeTab === tab.id"></div>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="status-indicator" :class="{ online: !loading }">
          <span class="status-dot"></span>
          <span class="status-text">{{ loading ? '加载中...' : '系统在线' }}</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Bar / Header -->
      <header class="top-bar">
        <div class="page-title">
          <h2>{{ currentTabLabel }}</h2>
          <p class="page-desc">{{ currentTabDesc }}</p>
        </div>
        <div class="top-actions">
           <!-- Potential Space for User Profile or Settings -->
        </div>
      </header>

      <!-- Content Scroll Text -->
      <div class="content-scroll">
        <transition name="fade-slide" mode="out-in">
           <!-- Claude Configuration Tab -->
           <div v-if="activeTab === 'claude'" key="claude" class="view-container">
             <div class="glass-card config-panel">
                <div class="card-header">
                  <h3>Claude Code 配置</h3>
                  <p>管理您的 Anthropic API 密钥和核心设置</p>
                </div>
                
                <el-form label-position="top" class="custom-form">
                   <!-- API Token -->
                   <el-form-item label="API 密钥 (ANTHROPIC_API_KEY)">
                     <el-input
                        v-model="tokenValue"
                        type="password"
                        placeholder="sk-ant-..."
                        show-password
                        class="custom-input"
                     >
                        <template #prefix>
                          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.536a2 2 0 00-.732 1.732l-.758 4.258h-2.27l.758-4.258C8.536 18.27 8.536 18.27 8 16a6 6 0 012-14h2"></path></svg>
                        </template>
                     </el-input>
                     <div class="form-hint">用于鉴权的 Anthropic API Key</div>
                   </el-form-item>

                   <!-- API URL -->
                   <el-form-item label="API 端点地址">
                     <el-input
                        v-model="urlValue"
                        placeholder="https://api.anthropic.com"
                        class="custom-input"
                     >
                       <template #prefix>
                         <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                       </template>
                     </el-input>
                   </el-form-item>

                   <!-- Model Selection -->
                   <el-form-item label="默认模型">
                     <el-select v-model="modelValue" placeholder="请选择模型" class="custom-select" filterable allow-create>
                        <el-option-group label="Claude 4.5 系列">
                          <el-option label="Claude Opus 4.5 (最强)" value="claude-opus-4-5-20251101" />
                          <el-option label="Claude Sonnet 4.5 (平衡)" value="claude-sonnet-4-5-20250929" />
                          <el-option label="Claude Haiku 4.5 (快速)" value="claude-haiku-4-5-20251001" />
                        </el-option-group>
                        <el-option-group label="Claude 4 系列">
                          <el-option label="Claude Opus 4" value="claude-opus-4-20250514" />
                          <el-option label="Claude Sonnet 4" value="claude-sonnet-4-20250514" />
                        </el-option-group>
                     </el-select>
                   </el-form-item>

                   <!-- Toggles -->
                   <div class="toggles-group">
                      <div class="toggle-item">
                        <div class="toggle-info">
                          <span class="toggle-label">禁用遥测</span>
                          <span class="toggle-desc">阻止发送统计数据到服务器</span>
                        </div>
                        <el-switch v-model="telemetryValue" />
                      </div>
                      <div class="toggle-item">
                        <div class="toggle-info">
                          <span class="toggle-label">节省流量模式</span>
                          <span class="toggle-desc">禁用非必要的网络请求</span>
                        </div>
                        <el-switch v-model="trafficValue" />
                      </div>
                      <div class="toggle-item">
                        <div class="toggle-info">
                          <span class="toggle-label">Git 共创署名</span>
                          <span class="toggle-desc">提交包含 Co-authored-by</span>
                        </div>
                        <el-switch v-model="coAuthorValue" />
                      </div>
                   </div>

                   <!-- Actions -->
                   <div class="form-actions">
                      <el-button type="primary" size="large" @click="handleSave" :loading="saving" class="save-btn">
                        {{ saving ? '正在保存...' : '保存配置' }}
                      </el-button>
                      <el-button type="default" size="large" @click="handleOpenFolder" class="secondary-btn">
                        打开配置目录
                      </el-button>
                   </div>
                </el-form>
             </div>
             
             <!-- Presets Area could go here... -->
           </div>

           <!-- Codex Tab -->
           <div v-else-if="activeTab === 'codex'" key="codex" class="view-container">
             <CodexConfigView />
           </div>

           <!-- Skills Tab -->
           <div v-else-if="activeTab === 'skills'" key="skills" class="view-container">
             <SkillsView />
           </div>
           
           <!-- Installer Tab -->
           <div v-else-if="activeTab === 'installer'" key="installer" class="view-container">
             <OneClickInstaller />
           </div>

           <!-- EnvVars Tab -->
           <div v-else-if="activeTab === 'envvar'" key="envvar" class="view-container">
             <EnvVarView />
           </div>
        </transition>
      </div>
    </main>

    <!-- Global Toast/Notification Container (if needed, but Element Plus uses its own) -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '@/stores/config.store'
import { useCodexStore } from '@/stores/codex.store'
import CodexConfigView from '@/components/CodexConfigView.vue'
import OneClickInstaller from '@/components/OneClickInstaller.vue'
import EnvVarView from '@/components/EnvVarView.vue'
import SkillsView from '@/components/SkillsView.vue'
import logoUrl from '@/assets/logo.svg?url'

const configStore = useConfigStore()
const codexStore = useCodexStore()

// Tabs Configuration
const activeTab = ref('claude')
const tabs = [
  { 
    id: 'claude', 
    label: '基础配置', 
    desc: '配置 Claude Code 的核心参数与模型',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke-linecap="round" stroke-linejoin="round"/></svg>' 
  },
  { 
    id: 'codex', 
    label: 'OpenAI/Codex', 
    desc: '配置 OpenAI 兼容的 API 设置',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z"/><path d="M10 9H14M10 12H12M10 15H11"/></svg>'
  },
  { 
    id: 'skills', 
    label: '技能库管理', 
    desc: '管理和同步您的 AI 助手技能',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
  },
  { 
    id: 'installer', 
    label: '一键部署', 
    desc: '快速安装必要的开发环境与工具',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  },
  { 
    id: 'envvar', 
    label: '环境变量', 
    desc: '系统级环境变量的可视化编辑器',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17l6-6-6-6"/><path d="M12 19h8"/></svg>'
  }
]

const currentTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label || '未知页面'
})
const currentTabDesc = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.desc || ''
})

const loading = computed(() => configStore.loading)
const saving = ref(false)

// Form Models
const tokenValue = ref('')
const urlValue = ref('')
const modelValue = ref('')
const telemetryValue = ref(true)
const trafficValue = ref(true)
const coAuthorValue = ref(false)

onMounted(async () => {
  await loadAllConfig()
})

async function loadAllConfig() {
  await configStore.loadConfig()
  await configStore.loadConfigPath()
  await codexStore.loadConfig() // Preload others
  
  // Sync local state
  tokenValue.value = configStore.token
  urlValue.value = configStore.baseUrl
  modelValue.value = configStore.config.model
  telemetryValue.value = configStore.disableTelemetry
  trafficValue.value = configStore.disableTraffic
  coAuthorValue.value = configStore.config.includeCoAuthoredBy
}

async function handleSave() {
  saving.value = true
  configStore.updateToken(tokenValue.value)
  configStore.updateBaseUrl(urlValue.value)
  configStore.updateModel(modelValue.value)
  configStore.toggleTelemetry(telemetryValue.value)
  configStore.toggleTraffic(trafficValue.value)
  configStore.toggleCoAuthor(coAuthorValue.value)

  const success = await configStore.saveConfig()
  saving.value = false
  
  if (success) {
    ElMessage.success('配置已成功保存')
  } else {
    ElMessage.error('保存失败，请检查日志')
  }
}

async function handleOpenFolder() {
  await configStore.openFolder()
}

</script>

<style>
/* Global Variables & Reset */
:root {
  /* Deep Space Theme */
  --bg-dark: #0B0B10; /* Deep Space Black */
  --bg-sidebar: #0f1014;
  --bg-card: rgba(255, 255, 255, 0.03); 
  --accent-primary: #8B5CF6; /* Violet */
  --accent-gradient: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  --accent-hover: #A78BFA;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8; /* Slate 400 */
  --border-color: rgba(255, 255, 255, 0.08);
  --glass-border: 1px solid rgba(255, 255, 255, 0.08);
  --sidebar-width: 260px;
  
  /* Shadows & Glows */
  --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.15);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Element Plus Overrides - FORCE DARK */
  --el-color-primary: var(--accent-primary);
  --el-text-color-regular: var(--text-primary);
  --el-text-color-primary: var(--text-primary);
  --el-text-color-secondary: var(--text-secondary);
  --el-bg-color: #1a1b26;
  --el-bg-color-overlay: #1e2028;
  --el-fill-color-blank: transparent;
  --el-border-color: rgba(255, 255, 255, 0.1);
  --el-border-color-light: rgba(255, 255, 255, 0.1);
  --el-mask-color: rgba(0, 0, 0, 0.7);

  /* Input Overrides */
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-text-color: #F8FAFC;
  --el-input-border-color: rgba(255, 255, 255, 0.1);
  --el-input-hover-border-color: var(--accent-hover);
  --el-input-focus-border-color: var(--accent-primary);
  
  /* Table Overrides */
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-text-color: var(--text-primary);
  --el-table-header-text-color: var(--text-secondary);
}

body {
  margin: 0;
  font-family: 'Inter', 'Microsoft YaHei', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  overflow: hidden; 
}

/* Noise Texture Overlay */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
}

/* App Container */
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: radial-gradient(circle at top right, #1f2430 0%, #0f1115 100%);
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 24px;
  box-sizing: border-box;
  z-index: 10;
}

.sidebar-header {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container {
  width: 44px;
  height: 44px;
  background: var(--accent-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.app-logo {
  width: 24px;
  height: 24px;
}

.app-title h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(90deg, #fff, #babbcc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.version-tag {
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(100, 108, 255, 0.1);
  color: var(--accent-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.active-indicator {
  position: absolute;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 12px var(--accent-primary), 0 0 24px var(--accent-primary);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f85149;
}

.status-indicator.online .status-dot {
  background: #3fb950;
  box-shadow: 0 0 8px rgba(63, 185, 80, 0.4);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: transparent; /* Let body gradient show through */
}

/* Background Gradients */
.main-content::before {
  content: '';
  position: absolute;
  top: -200px;
  right: -100px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.main-content::after {
  content: '';
  position: absolute;
  bottom: -200px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.top-bar {
  padding: 30px 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.page-title h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 40px 40px 40px;
}

.view-container {
  max-width: 900px;
  margin: 0 auto;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Glass Card & Forms */
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: var(--glass-border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: var(--shadow-glow), var(--card-shadow);
  border-color: rgba(139, 92, 246, 0.2);
}

.card-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.card-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.card-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

/* Element Plus Overrides for Dark Theme */
.el-form-item__label {
  color: var(--text-secondary) !important;
  font-weight: 500;
}

/* Global Input Overrides - High Specificity */
:deep(.el-input__wrapper), 
:deep(.el-select__wrapper), 
:deep(.el-textarea__inner) {
  background-color: var(--el-input-bg-color) !important;
  box-shadow: 0 0 0 1px var(--el-input-border-color) inset !important;
  color: white !important;
}

:deep(.el-input__wrapper.is-focus), 
:deep(.el-select__wrapper.is-focused),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--accent-primary) inset !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
   background-color: rgba(255, 255, 255, 0.05) !important;
   box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
}

:deep(.el-input__inner) {
  color: #F8FAFC !important;
  caret-color: var(--accent-primary);
  background: transparent !important;
  height: 100%;
}

:deep(.el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: #F8FAFC !important;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.1) inset !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--accent-primary) inset !important;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.toggles-group {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0,0,0,0.2);
  padding: 20px;
  border-radius: 12px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-label {
  font-weight: 500;
  font-size: 14px;
}

.toggle-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.form-actions {
  margin-top: 40px;
  display: flex;
  gap: 16px;
}

.save-btn {
  background: var(--accent-gradient) !important;
  border: none !important;
  flex: 1;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.4);
}

.secondary-btn {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: var(--text-primary) !important;
}

/* Fade Transition for Tabs */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
