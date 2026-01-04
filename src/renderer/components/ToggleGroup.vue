<template>
  <el-form-item label="选项">
    <div class="toggle-group">
      <el-checkbox
        :model-value="disableTelemetry"
        @update:model-value="handleTelemetryToggle"
      >
        禁用遥测数据收集
      </el-checkbox>

      <el-checkbox
        :model-value="disableTraffic"
        @update:model-value="handleTrafficToggle"
      >
        禁用非必要网络请求
      </el-checkbox>

      <el-checkbox
        :model-value="config.includeCoAuthoredBy"
        @update:model-value="handleCoAuthorToggle"
      >
        提交时包含 Co-authored-by
      </el-checkbox>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()

const disableTelemetry = computed(() => configStore.disableTelemetry)
const disableTraffic = computed(() => configStore.disableTraffic)
const { config } = configStore

const handleTelemetryToggle = (value: boolean) => {
  configStore.toggleTelemetry(value)
}

const handleTrafficToggle = (value: boolean) => {
  configStore.toggleTraffic(value)
}

const handleCoAuthorToggle = (value: boolean) => {
  configStore.toggleCoAuthor(value)
}
</script>

<style scoped>
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
