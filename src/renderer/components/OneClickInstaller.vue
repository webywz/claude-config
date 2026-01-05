<template>
  <div class="installer-container">
    <!-- Header -->
    <div class="installer-header">
      <div class="header-icon">
        <el-icon :size="32"><Download /></el-icon>
      </div>
      <div class="header-text">
        <h2>一键安装开发工具</h2>
        <p>自动安装 Node.js、Claude Code CLI 和 Codex CLI</p>
      </div>
    </div>

    <!-- Overall Progress -->
    <div v-if="installing || overallProgress > 0" class="overall-progress">
      <div class="progress-header">
        <span>安装进度</span>
        <span>{{ installedCount }} / {{ tools.length }}</span>
      </div>
      <el-progress
        :percentage="overallProgress"
        :status="allInstalled ? 'success' : undefined"
        :stroke-width="12"
      />
    </div>

    <!-- Tools Grid -->
    <div class="tools-grid">
      <ToolCard
        v-for="tool in toolList"
        :key="tool.id"
        :tool="tool"
        :status="toolStatus[tool.id]"
        :disabled="installing && currentTool !== tool.id"
        @install="installTool(tool.id)"
      />
    </div>

    <!-- Action Section -->
    <div class="action-section">
      <el-button
        type="primary"
        size="large"
        :loading="installing"
        :disabled="!canInstallAll"
        @click="installAll"
      >
        <el-icon v-if="!installing && !allInstalled"><Download /></el-icon>
        {{ installing ? '安装中...' : allInstalled ? '全部安装完成' : '一键安装所有工具' }}
      </el-button>

      <el-button
        v-if="installing"
        size="large"
        @click="cancelCurrent"
      >
        取消安装
      </el-button>

      <el-button
        v-if="!installing && logs.length > 0"
        size="large"
        @click="checkAllTools"
      >
        <el-icon><Refresh /></el-icon>
        重新检测
      </el-button>
    </div>

    <!-- Logs Section -->
    <div v-if="logs.length > 0" class="logs-section">
      <div class="logs-header">
        <h3>安装日志</h3>
        <div class="logs-actions">
          <el-button size="small" @click="clearLogs">清除</el-button>
          <el-button size="small" @click="toggleLogs">
            {{ showLogs ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>
      <transition name="fade">
        <div v-show="showLogs" class="logs-content" ref="logsRef">
          <div
            v-for="log in logs"
            :key="log.id"
            :class="['log-entry', log.type]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-tool">[{{ toolName(log.toolId) }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useInstallerStore } from '@/stores/installer.store'
import ToolCard from './ToolCard.vue'

const installerStore = useInstallerStore()

// Use storeToRefs to maintain reactivity
const {
  tools,
  toolStatus,
  logs,
  installing,
  currentTool,
  overallProgress,
  allInstalled,
  installedCount,
  canInstallAll
} = storeToRefs(installerStore)

// Actions don't need refs
const { checkAllTools, installTool, installAll, clearLogs, cancelInstallation } = installerStore

const showLogs = ref(false)
const logsRef = ref<HTMLElement | null>(null)

const toolList = computed(() => {
  return [
    { id: 'nodejs', name: 'Node.js', description: 'JavaScript 运行时环境 (v20 LTS)' },
    { id: 'claude', name: 'Claude Code CLI', description: 'Claude 命令行工具' },
    { id: 'codex', name: 'Codex CLI', description: 'Codex 命令行工具' }
  ]
})

function toolName(toolId: string): string {
  const tool = toolList.value.find(t => t.id === toolId)
  return tool?.name || toolId
}

function toggleLogs() {
  showLogs.value = !showLogs.value
}

function cancelCurrent() {
  if (currentTool.value) {
    installerStore.cancelInstallation(currentTool.value)
  }
}

// Auto-scroll logs to bottom
watch(() => logs.value?.length ?? 0, async () => {
  if (showLogs.value && logsRef.value) {
    await nextTick()
    logsRef.value.scrollTo({
      top: logsRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
})

onMounted(() => {
  checkAllTools()
})
</script>

<style scoped>
.installer-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.installer-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 16px;
  border: 1px solid var(--border-color, #30363d);
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  flex-shrink: 0;
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #f0f6fc);
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #8b949e);
}

.overall-progress {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  border: 1px solid var(--border-color, #30363d);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #8b949e);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.action-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  border: 1px solid var(--border-color, #30363d);
}

.action-section .el-button {
  min-width: 160px;
}

.logs-section {
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #30363d);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.logs-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #f0f6fc);
}

.logs-actions {
  display: flex;
  gap: 8px;
}

.logs-content {
  max-height: 300px;
  overflow-y: auto;
  /* background: rgba(0, 0, 0, 0.3); */
  border-radius: 8px;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.logs-content::-webkit-scrollbar {
  width: 8px;
}

.logs-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.logs-content::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 4px;
}

.logs-content::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  line-height: 1.6;
}

.log-entry:not(:last-child) {
  border-bottom: 1px solid rgba(48, 54, 61, 0.5);
}

.log-time {
  color: var(--text-secondary, #8b949e);
  flex-shrink: 0;
}

.log-tool {
  color: #8b5cf6;
  font-weight: 500;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-entry.info .log-message {
  color: var(--text-primary, #f0f6fc);
}

.log-entry.success .log-message {
  color: #67c23a;
}

.log-entry.error .log-message {
  color: #f56c6c;
}

.log-entry.warning .log-message {
  color: #e6a23c;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, max-height 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
