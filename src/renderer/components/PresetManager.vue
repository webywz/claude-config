<template>
  <div class="preset-manager">
    <el-divider>配置预设</el-divider>

    <div class="preset-actions">
      <el-select
        v-model="selectedPreset"
        placeholder="选择预设..."
        style="width: 200px"
      >
        <el-option
          v-for="name in presetNames"
          :key="name"
          :label="name"
          :value="name"
        />
      </el-select>

      <el-button
        type="primary"
        :disabled="!selectedPreset"
        @click="handleApply"
      >
        应用
      </el-button>

      <el-button
        type="danger"
        :disabled="!selectedPreset"
        @click="handleDelete"
      >
        删除
      </el-button>
    </div>

    <div class="preset-save">
      <el-input
        v-model="newPresetName"
        placeholder="输入预设名称..."
        style="width: 200px"
      />
      <el-button
        type="success"
        :disabled="!newPresetName"
        @click="handleSave"
      >
        保存为预设
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()
const presetNames = computed(() => configStore.presetNames)

const selectedPreset = ref('')
const newPresetName = ref('')

async function handleApply() {
  if (!selectedPreset.value) {
    ElMessage.error('请选择预设')
    return
  }

  const success = await configStore.applyPreset(selectedPreset.value)
  if (success) {
    ElMessage.success(`已应用预设 "${selectedPreset.value}"`)
    selectedPreset.value = ''
  }
}

async function handleDelete() {
  if (!selectedPreset.value) {
    ElMessage.error('请选择预设')
    return
  }

  const success = await configStore.deletePreset(selectedPreset.value)
  if (success) {
    ElMessage.success(`已删除预设 "${selectedPreset.value}"`)
    selectedPreset.value = ''
  }
}

async function handleSave() {
  if (!newPresetName.value) {
    ElMessage.error('请输入预设名称')
    return
  }

  const success = await configStore.savePreset(newPresetName.value)
  if (success) {
    ElMessage.success(`预设 "${newPresetName.value}" 已保存`)
    newPresetName.value = ''
  }
}
</script>

<style scoped>
.preset-manager {
  margin-top: 20px;
}

.preset-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.preset-save {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
