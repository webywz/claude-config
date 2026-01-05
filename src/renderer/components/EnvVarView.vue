<template>
  <div class="envvar-container">
    <!-- Header -->
    <div class="envvar-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="header-text">
        <h2>Windows 系统环境变量</h2>
        <p>管理用户级和系统级环境变量及 Path 配置</p>
      </div>
    </div>

    <!-- Path Management -->
    <div class="path-section">
      <EnvVarEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import EnvVarEditor from './EnvVarEditor.vue'
</script>

<style scoped>
.envvar-container {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.envvar-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
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

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary, #f0f6fc);
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #8b949e);
}

.path-section {
  padding: 0;
  background: transparent;
  border: none;
}
</style>
