<template>
  <el-form-item label="API URL (BASE_URL)">
    <el-input
      :model-value="baseUrl"
      placeholder="https://api.anthropic.com"
      clearable
      @update:model-value="handleUpdate"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()

const baseUrl = computed(() => configStore.baseUrl)

const handleUpdate = (value: string) => {
  configStore.updateBaseUrl(value)
}
</script>
