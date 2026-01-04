import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../config/types'

const api: ElectronAPI = {
  config: {
    load: () => ipcRenderer.invoke('config:load'),
    save: (config) => ipcRenderer.invoke('config:save', config)
  },
  presets: {
    load: () => ipcRenderer.invoke('presets:load'),
    save: (presets) => ipcRenderer.invoke('presets:save', presets),
    apply: (name) => ipcRenderer.invoke('presets:apply', name),
    delete: (name) => ipcRenderer.invoke('presets:delete', name)
  },
  system: {
    openFolder: () => ipcRenderer.invoke('system:open-folder'),
    getConfigPath: () => ipcRenderer.invoke('system:get-config-path'),
    getEnvVars: () => ipcRenderer.invoke('system:get-env-vars'),
    setEnvVar: (name, value) => ipcRenderer.invoke('system:set-env-var', name, value),
    deleteEnvVar: (name) => ipcRenderer.invoke('system:delete-env-var', name),
    getPaths: () => ipcRenderer.invoke('system:get-paths'),
    addPath: (path) => ipcRenderer.invoke('system:add-path', path),
    removePath: (path) => ipcRenderer.invoke('system:remove-path', path),
    movePath: (from, to) => ipcRenderer.invoke('system:move-path', from, to)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
