import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../config/types'

const api: ElectronAPI = {
  config: {
    load: () => ipcRenderer.invoke('config:load'),
    save: (config) => ipcRenderer.invoke('config:save', config)
  },
  codex: {
    loadConfig: () => ipcRenderer.invoke('codex:load-config'),
    saveConfig: (config) => ipcRenderer.invoke('codex:save-config', config),
    loadAuth: () => ipcRenderer.invoke('codex:load-auth'),
    saveAuth: (auth) => ipcRenderer.invoke('codex:save-auth', auth),
    getConfigPath: () => ipcRenderer.invoke('codex:get-config-path'),
    getAuthPath: () => ipcRenderer.invoke('codex:get-auth-path'),
    getConfigRaw: () => ipcRenderer.invoke('codex:get-config-raw'),
    loadPresets: () => ipcRenderer.invoke('codex-presets:load'),
    savePresets: (presets) => ipcRenderer.invoke('codex-presets:save', presets),
    applyPreset: (name) => ipcRenderer.invoke('codex-presets:apply', name),
    deletePreset: (name) => ipcRenderer.invoke('codex-presets:delete', name)
  },
  presets: {
    load: () => ipcRenderer.invoke('presets:load'),
    save: (presets) => ipcRenderer.invoke('presets:save', presets),
    apply: (name) => ipcRenderer.invoke('presets:apply', name),
    delete: (name) => ipcRenderer.invoke('presets:delete', name)
  },
  system: {
    openFolder: () => ipcRenderer.invoke('system:open-folder'),
    openCodexFolder: () => ipcRenderer.invoke('system:open-codex-folder'),
    getConfigPath: () => ipcRenderer.invoke('system:get-config-path'),
    getEnvVars: () => ipcRenderer.invoke('system:get-env-vars'),
    setEnvVar: (name, value) => ipcRenderer.invoke('system:set-env-var', name, value),
    deleteEnvVar: (name) => ipcRenderer.invoke('system:delete-env-var', name),
    getPaths: () => ipcRenderer.invoke('system:get-paths'),
    addPath: (path) => ipcRenderer.invoke('system:add-path', path),
    removePath: (path) => ipcRenderer.invoke('system:remove-path', path),
    movePath: (from, to) => ipcRenderer.invoke('system:move-path', from, to)
  },
  installer: {
    checkTool: (toolId) => ipcRenderer.invoke('installer:check-tool', toolId),
    checkAllTools: () => ipcRenderer.invoke('installer:check-all'),
    downloadTool: (toolId) => ipcRenderer.invoke('installer:download', toolId),
    installTool: (toolId, installerPath) => ipcRenderer.invoke('installer:install', toolId, installerPath),
    configureToolEnv: (toolId, toolPath) => ipcRenderer.invoke('installer:configure-env', toolId, toolPath),
    verifyInstallation: (toolId) => ipcRenderer.invoke('installer:verify', toolId),
    cancelInstallation: (toolId) => ipcRenderer.invoke('installer:cancel', toolId)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
