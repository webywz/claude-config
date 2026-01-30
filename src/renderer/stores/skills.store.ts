
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillScanResult, SkillProvider } from '../../../electron/config/types'

export const useSkillsStore = defineStore('skills', () => {
    const providers = ref<Record<SkillProvider, any[]>>({
        claude: [],
        codex: [],
        gemini: [],
        antigravity: [],
        trae: []
    })

    const allSkills = ref<string[]>([])
    const paths = ref<Record<SkillProvider, string>>({
        claude: '',
        codex: '',
        gemini: '',
        antigravity: '',
        trae: ''
    })
    const loading = ref(false)
    const syncing = ref(false)
    const statusMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

    let statusTimeout: NodeJS.Timeout | null = null
    function setStatus(type: 'success' | 'error', text: string) {
        if (statusTimeout) clearTimeout(statusTimeout)
        statusMessage.value = { type, text }
        statusTimeout = setTimeout(() => {
            statusMessage.value = null
        }, 3000)
    }

    async function scan() {
        loading.value = true
        try {
            const result = await window.electronAPI.skills.scan()
            providers.value = result.providers
            allSkills.value = result.allSkills

            const pathResult = await window.electronAPI.skills.getPaths()
            paths.value = pathResult
        } catch (error: any) {
            console.error('Failed to scan skills:', error)
            setStatus('error', `扫描 Skills 失败: ${error.message || error}`)
        } finally {
            loading.value = false
        }
    }

    async function sync(targets: SkillProvider[] | 'all') {
        syncing.value = true
        try {
            const result = await window.electronAPI.skills.sync(targets)
            if (result.success) {
                setStatus('success', result.message)
                await scan() // Rescan to update UI
            } else {
                setStatus('error', result.message)
            }
        } catch (error) {
            console.error('Failed to sync skills:', error)
            setStatus('error', '同步失败')
        } finally {
            syncing.value = false
        }
    }

    async function create(input: { name: string, description?: string, providers: SkillProvider[] }) {
        loading.value = true
        try {
            const result = await window.electronAPI.skills.create(input)
            if (result.success) {
                setStatus('success', result.message)
                await scan()
                return true
            } else {
                setStatus('error', result.message)
                return false
            }
        } catch (error) {
            console.error('Failed to create skill:', error)
            setStatus('error', `创建失败: ${error instanceof Error ? error.message : String(error)}`)
            return false
        } finally {
            loading.value = false
        }
    }

    async function importSkill(filePath: string, targetProviders: SkillProvider[]) {
        loading.value = true
        try {
            const result = await window.electronAPI.skills.import(filePath, targetProviders)
            if (result.success) {
                setStatus('success', result.message)
                await scan()
                return true
            } else {
                setStatus('error', result.message)
                return false
            }
        } catch (error) {
            console.error('Failed to import skill:', error)
            setStatus('error', `导入失败: ${error instanceof Error ? error.message : String(error)}`)
            return false
        } finally {
            loading.value = false
        }
    }

    async function deleteSkill(name: string) {
        if (!confirm(`确定要删除 Skill "${name}" 吗？这将从所有配置的提供商中删除它。`)) return

        loading.value = true
        try {
            const result = await window.electronAPI.skills.delete(name)
            if (result.success) {
                setStatus('success', result.message)
                await scan()
            } else {
                setStatus('error', result.message)
            }
        } catch (error) {
            console.error('Failed to delete skill:', error)
            setStatus('error', `删除失败: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
            loading.value = false
        }
    }

    async function copySkills(names: string[], targetPath: string) {
        loading.value = true
        try {
            const result = await window.electronAPI.skills.copy(names, targetPath)
            if (result.success) {
                setStatus('success', result.message)
                await scan()
                return true
            } else {
                setStatus('error', result.message)
                return false
            }
        } catch (error) {
            console.error('Failed to copy skills:', error)
            setStatus('error', `复制失败: ${error instanceof Error ? error.message : String(error)}`)
            return false
        } finally {
            loading.value = false
        }
    }

    function clearStatus() {
        statusMessage.value = null
        if (statusTimeout) clearTimeout(statusTimeout)
    }

    return {
        providers,
        allSkills,
        paths,
        loading,
        syncing,
        statusMessage,
        scan,
        sync,
        create,
        importSkill,
        deleteSkill,
        copySkills,
        clearStatus
    }
})
