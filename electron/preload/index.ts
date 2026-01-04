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
    getConfigPath: () => ipcRenderer.invoke('system:get-config-path')
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
