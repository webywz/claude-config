import { ipcMain, shell } from 'electron'
import { ConfigManager } from '../config/config-manager'
import type { ClaudeConfig, Presets } from '../config/types'

const configManager = new ConfigManager()

export function registerConfigHandlers(): void {
  ipcMain.handle('config:load', (): ClaudeConfig => {
    return configManager.load()
  })

  ipcMain.handle('config:save', (_, config: ClaudeConfig): boolean => {
    return configManager.save(config)
  })
}

export function registerPresetHandlers(): void {
  ipcMain.handle('presets:load', (): Presets => {
    return configManager.loadPresets()
  })

  ipcMain.handle('presets:save', (_, presets: Presets): boolean => {
    return configManager.savePresets(presets)
  })

  ipcMain.handle('presets:apply', (_, name: string): { success: boolean; config?: ClaudeConfig } => {
    const presets = configManager.loadPresets()
    if (name in presets) {
      const config = presets[name]
      const success = configManager.save(config)
      return { success, config: success ? config : undefined }
    }
    return { success: false }
  })

  ipcMain.handle('presets:delete', (_, name: string): boolean => {
    const presets = configManager.loadPresets()
    if (name in presets) {
      delete presets[name]
      return configManager.savePresets(presets)
    }
    return false
  })
}

export function registerSystemHandlers(): void {
  ipcMain.handle('system:open-folder', (): void => {
    const folder = configManager.getConfigPath()
    shell.openPath(folder)
  })

  ipcMain.handle('system:get-config-path', (): string => {
    return configManager.getConfigPath()
  })
}
