import { contextBridge, ipcRenderer, webUtils } from 'electron'
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
    openPath: (path) => ipcRenderer.invoke('system:open-path', path),
    getConfigPath: () => ipcRenderer.invoke('system:get-config-path'),
    getEnvVars: () => ipcRenderer.invoke('system:get-env-vars'),
    setEnvVar: (name, value) => ipcRenderer.invoke('system:set-env-var', name, value),
    deleteEnvVar: (name) => ipcRenderer.invoke('system:delete-env-var', name),
    getPaths: () => ipcRenderer.invoke('system:get-paths'),
    addPath: (path) => ipcRenderer.invoke('system:add-path', path),
    removePath: (path) => ipcRenderer.invoke('system:remove-path', path),
    movePath: (from, to) => ipcRenderer.invoke('system:move-path', from, to),
    showOpenDialog: (options) => ipcRenderer.invoke('system:show-open-dialog', options)
  },
  installer: {
    checkTool: (toolId) => ipcRenderer.invoke('installer:check-tool', toolId),
    checkAllTools: () => ipcRenderer.invoke('installer:check-all'),
    downloadTool: (toolId) => ipcRenderer.invoke('installer:download', toolId),
    installTool: (toolId, installerPath) => ipcRenderer.invoke('installer:install', toolId, installerPath),
    configureToolEnv: (toolId, toolPath) => ipcRenderer.invoke('installer:configure-env', toolId, toolPath),
    verifyInstallation: (toolId) => ipcRenderer.invoke('installer:verify', toolId),
    cancelInstallation: (toolId) => ipcRenderer.invoke('installer:cancel', toolId)
  },
  skills: {
    scan: () => ipcRenderer.invoke('skills:scan'),
    sync: (targets) => ipcRenderer.invoke('skills:sync', targets),
    getPaths: () => ipcRenderer.invoke('skills:get-paths'),
    create: (input) => ipcRenderer.invoke('skills:create', input),
    delete: (skillName) => ipcRenderer.invoke('skills:delete', skillName),
    import: (filePath, targetProviders) => ipcRenderer.invoke('skills:import', filePath, targetProviders)
  },
  webUtils: {
    getPathForFile: (file: File) => webUtils.getPathForFile(file)
  },
  // Event listener methods for progress updates (with channel whitelist for security)
  on: (channel: string, listener: (...args: any[]) => void) => {
    // 只允许监听特定的安装进度通道
    const allowedChannels = [
      'installer:progress:nodejs',
      'installer:progress:claude',
      'installer:progress:codex'
    ]
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => listener(...args))
    } else {
      console.warn(`Blocked attempt to listen on unauthorized channel: ${channel}`)
    }
  },
  removeListener: (channel: string, listener: (...args: any[]) => void) => {
    const allowedChannels = [
      'installer:progress:nodejs',
      'installer:progress:claude',
      'installer:progress:codex'
    ]
    if (allowedChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, listener)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
