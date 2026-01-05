<template>
  <div :class="['tool-card', { installed: status.installed, installing: status.installing }]">
    <!-- Header -->
    <div class="tool-header">
      <div class="tool-icon">
        <component :is="iconComponent" />
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

const iconComponent = computed(() => {
  // For now, return a placeholder
  // You can add specific icons for each tool later
  return 'div'
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
  font-size: 24px;
  flex-shrink: 0;
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
