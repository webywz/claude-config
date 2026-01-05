<template>
  <div :class="['tool-card', { installed: status.installed, installing: status.installing }]">
    <!-- Header -->
    <div class="tool-header">
      <div class="tool-icon" :class="`tool-icon-${tool.id}`">
        <!-- Node.js Icon -->
        <svg v-if="tool.id === 'nodejs'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#689F63"/>
          <path d="M2 7L12 12L12 22L2 17L2 7Z" fill="#8BC34A"/>
          <path d="M22 7L12 12L12 22L22 17L22 7Z" fill="#9CCC65"/>
          <path d="M12 12V22" stroke="#fff" stroke-width="1"/>
          <path d="M12 12L2 7" stroke="#fff" stroke-width="1"/>
          <path d="M12 12L22 7" stroke="#fff" stroke-width="1"/>
        </svg>

        <!-- Claude Icon -->
        <svg v-else-if="tool.id === 'claude'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="claude-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#D97706"/>
              <stop offset="50%" stop-color="#92400E"/>
              <stop offset="100%" stop-color="#78350F"/>
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#claude-gradient)"/>
          <path d="M8 12C8 9.1 8.9 10 10 10C11.1 10 12 9.1 12 8C12 6.9 11.1 6 10 6C8.9 6 8 6.9 8 8Z" fill="#FEF3C7"/>
          <path d="M16 16C16 17.1 16.9 18 18 18C19.1 18 20 17.1 20 16C20 14.9 19.1 14 18 14C16.9 14 16 14.9 16 16Z" fill="#FEF3C7"/>
          <path d="M7.5 15C7.5 16.38 8.62 17.5 10 17.5C11.38 17.5 12.5 16.38 12.5 15" stroke="#FEF3C7" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

        <!-- Codex Icon -->
        <svg v-else-if="tool.id === 'codex'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="codex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366F1"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#codex-gradient)"/>
          <path d="M7 8H17M7 12H17M7 16H13" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="15" cy="16" r="2" fill="#FCD34D"/>
        </svg>
      </div>
      <div class="tool-info">
        <h3 class="tool-name">{{ tool.name }}</h3>
        <p class="tool-description">{{ tool.description }}</p>
      </div>
    </div>

    <!-- Status -->
    <div class="tool-status">
      <div v-if="status.installed" class="status-badge success">
        <el-icon><SuccessFilled /></el-icon>
        <span>已安装 {{ status.version ? `v${status.version}` : '' }}</span>
      </div>
      <div v-else-if="status.installing" class="status-badge installing">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ stepText }}</span>
      </div>
      <div v-else-if="status.error" class="status-badge error">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>安装失败</span>
      </div>
      <div v-else class="status-badge pending">
        <el-icon><WarningFilled /></el-icon>
        <span>未安装</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="status.installing" class="tool-progress">
      <el-progress :percentage="status.progress" :stroke-width="8" />
    </div>

    <!-- Error Message -->
    <div v-if="status.error" class="tool-error">
      <el-alert :title="status.error" type="error" :closable="false" />
    </div>

    <!-- Actions -->
    <div class="tool-actions">
      <el-button
        v-if="!status.installed && !status.installing"
        type="primary"
        :disabled="disabled"
        @click="$emit('install', tool.id)"
      >
        安装
      </el-button>
      <el-button
        v-else-if="status.installed"
        disabled
        type="success"
      >
        已完成
      </el-button>
      <el-button
        v-else-if="status.installing"
        disabled
        type="warning"
        :loading="true"
      >
        安装中...
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SuccessFilled, Loading, CircleCloseFilled, WarningFilled } from '@element-plus/icons-vue'
import type { ToolStatus } from '@/stores/installer.store'

interface Tool {
  id: string
  name: string
  description: string
}

interface Props {
  tool: Tool
  status: ToolStatus
  disabled?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  install: [id: string]
}>()

const stepText = computed(() => {
  const stepMap: Record<string, string> = {
    checking: '检测中...',
    downloading: '下载中...',
    installing: '安装中...',
    configuring: '配置环境变量...',
    verifying: '验证中...',
    completed: '已完成',
    failed: '失败'
  }
  return stepMap[props.status.step] || '处理中...'
})
</script>

<style scoped>
.tool-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.tool-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.tool-card.installed {
  border-color: rgba(103, 194, 58, 0.3);
}

.tool-card.installing {
  border-color: rgba(230, 162, 60, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(230, 162, 60, 0); }
}

.tool-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.tool-icon svg {
  width: 32px;
  height: 32px;
}

.tool-icon-nodejs {
  background: linear-gradient(135deg, rgba(104, 159, 99, 0.2) 0%, rgba(139, 195, 74, 0.2) 100%);
}

.tool-icon-claude {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(146, 64, 14, 0.2) 100%);
}

.tool-icon-codex {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #f0f6fc);
}

.tool-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #8b949e);
}

.tool-status {
  margin-bottom: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.success {
  background: rgba(103, 194, 58, 0.15);
  color: #67c23a;
}

.status-badge.installing {
  background: rgba(230, 162, 60, 0.15);
  color: #e6a23c;
}

.status-badge.error {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
}

.status-badge.pending {
  background: rgba(144, 147, 153, 0.15);
  color: #909399;
}

.tool-progress {
  margin-bottom: 12px;
}

.tool-error {
  margin-bottom: 12px;
}

.tool-actions {
  display: flex;
  gap: 8px;
}

.tool-actions .el-button {
  flex: 1;
}
</style>
