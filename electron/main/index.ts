import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import { ipcMain, shell } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join as pathJoin, dirname } from 'path'
import { homedir } from 'os'

// Types
interface ClaudeConfig {
  env: {
    ANTHROPIC_AUTH_TOKEN?: string
    ANTHROPIC_API_KEY?: string
    ANTHROPIC_BASE_URL?: string
    DISABLE_TELEMETRY?: string
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC?: string
    OTEL_METRICS_EXPORTER?: string
  }
  model: string
  includeCoAuthoredBy: boolean
  permissions: {
    allow: string[]
    deny: string[]
  }
}

interface Presets {
  [key: string]: ClaudeConfig
}

// Config Manager
const configPath = pathJoin(homedir(), '.claude', 'settings.json')
const presetsPath = pathJoin(homedir(), '.claude_presets', 'presets.json')

function loadConfig(): ClaudeConfig {
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }
  return {
    env: {},
    model: '',
    includeCoAuthoredBy: false,
    permissions: { allow: [], deny: [] }
  }
}

function saveConfig(config: ClaudeConfig): boolean {
  try {
    console.log('[Main] Saving config to:', configPath)
    console.log('[Main] Config data:', JSON.stringify(config, null, 2))

    const dir = dirname(configPath)
    console.log('[Main] Directory path:', dir)

    if (!existsSync(dir)) {
      console.log('[Main] Creating directory:', dir)
      mkdirSync(dir, { recursive: true })
    } else {
      console.log('[Main] Directory exists')
    }

    // Test write permissions by checking if we can write to the directory
    try {
      const testPath = pathJoin(dir, '.write-test')
      writeFileSync(testPath, 'test')
      // Remove test file if it exists
      if (existsSync(testPath)) {
        const fs = require('fs')
        fs.unlinkSync(testPath)
      }
      console.log('[Main] Write permissions OK')
    } catch (permError) {
      console.error('[Main] Write permission error:', permError)
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')

    // Verify the file was written
    if (existsSync(configPath)) {
      console.log('[Main] Config saved successfully, file exists')
      return true
    } else {
      console.error('[Main] File was not created')
      return false
    }
  } catch (error) {
    console.error('[Main] Failed to save config:', error)
    console.error('[Main] Error code:', (error as any)?.code)
    console.error('[Main] Error message:', (error as any)?.message)
    return false
  }
}

function loadPresets(): Presets {
  if (existsSync(presetsPath)) {
    try {
      const content = readFileSync(presetsPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to load presets:', error)
    }
  }
  return {}
}

function savePresets(presets: Presets): boolean {
  try {
    console.log('[Main] Saving presets to:', presetsPath)
    console.log('[Main] Presets data:', JSON.stringify(presets, null, 2))
    console.log('[Main] Preset keys:', Object.keys(presets))

    const dir = dirname(presetsPath)
    console.log('[Main] Directory path:', dir)

    if (!existsSync(dir)) {
      console.log('[Main] Creating directory:', dir)
      mkdirSync(dir, { recursive: true })
    } else {
      console.log('[Main] Directory exists')
    }

    // Test write permissions
    try {
      const testPath = pathJoin(dir, '.write-test')
      writeFileSync(testPath, 'test')
      if (existsSync(testPath)) {
        const fs = require('fs')
        fs.unlinkSync(testPath)
      }
      console.log('[Main] Write permissions OK')
    } catch (permError) {
      console.error('[Main] Write permission error:', permError)
    }

    writeFileSync(presetsPath, JSON.stringify(presets, null, 2), 'utf-8')

    // Verify the file was written
    if (existsSync(presetsPath)) {
      console.log('[Main] Presets saved successfully, file exists')
      return true
    } else {
      console.error('[Main] File was not created')
      return false
    }
  } catch (error) {
    console.error('[Main] Failed to save presets:', error)
    console.error('[Main] Error code:', (error as any)?.code)
    console.error('[Main] Error message:', (error as any)?.message)
    return false
  }
}

// IPC Handlers
ipcMain.handle('config:load', (): ClaudeConfig => {
  return loadConfig()
})

ipcMain.handle('config:save', (_, config: ClaudeConfig): boolean => {
  return saveConfig(config)
})

ipcMain.handle('presets:load', (): Presets => {
  return loadPresets()
})

ipcMain.handle('presets:save', (_, presets: Presets): boolean => {
  return savePresets(presets)
})

ipcMain.handle('presets:apply', (_, name: string): { success: boolean; config?: ClaudeConfig } => {
  const presets = loadPresets()
  if (name in presets) {
    const config = presets[name]
    const success = saveConfig(config)
    return { success, config: success ? config : undefined }
  }
  return { success: false }
})

ipcMain.handle('presets:delete', (_, name: string): boolean => {
  const presets = loadPresets()
  if (name in presets) {
    delete presets[name]
    return savePresets(presets)
  }
  return false
})

ipcMain.handle('system:open-folder', (): void => {
  shell.openPath(configPath)
})

ipcMain.handle('system:get-config-path', (): string => {
  return configPath
})

// Window Management
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 560,
    height: 850,
    minWidth: 540,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// App lifecycle
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.claude.config')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
