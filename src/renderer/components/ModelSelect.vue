<template>
  <el-form-item label="Model">
    <el-select
      :model-value="config.model"
      placeholder="选择模型..."
      @update:model-value="handleUpdate"
    >
      <el-option
        v-for="model in MODELS"
        :key="model"
        :label="model"
        :value="model"
      />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()
const { config, MODELS } = configStore

const handleUpdate = (value: string) => {
  configStore.updateModel(value)
}
</script>
