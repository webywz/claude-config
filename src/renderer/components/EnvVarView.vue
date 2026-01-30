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
        <h2>系统环境变量</h2>
        <p>Windows 环境变量与 Path 配置管理</p>
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
  width: 100%;
  padding: 10px;
}

.envvar-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.path-section {
  padding: 0;
  background: transparent;
  border: none;
}
</style>
