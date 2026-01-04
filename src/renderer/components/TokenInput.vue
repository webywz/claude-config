<template>
  <el-form-item label="API Token" required>
    <el-input
      :model-value="token"
      :type="showToken ? 'text' : 'password'"
      placeholder="sk-ant-..."
      clearable
      @update:model-value="handleUpdate"
    >
      <template #append>
        <el-button :icon="showToken ? Hide : View" @click="showToken = !showToken" />
      </template>
    </el-input>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()
const showToken = ref(false)

const token = computed(() => configStore.token)

const handleUpdate = (value: string) => {
  configStore.updateToken(value)
}
</script>
