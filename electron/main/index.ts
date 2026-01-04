import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import { ipcMain, shell } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join as pathJoin, dirname } from 'path'
import { homedir } from 'os'
import { execSync } from 'child_process'

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

// Windows System Environment Variables
interface EnvVarWithType {
  name: string
  value: string
  type: 'user' | 'system'
}

// Path Environment Variable Management
interface PathEntry {
  value: string
  type: 'user' | 'system'
}

function getUserEnvVars(): Record<string, string> {
  try {
    if (process.platform === 'win32') {
      // Read user environment variables from registry
      const output = execSync('reg query "HKCU\\Environment"', {
        encoding: 'utf-8',
        windowsHide: true
      })
      const envVars: Record<string, string> = {}

      const lines = output.split('\n')
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Match: NAME    REG_TYPE    value
        const match = trimmedLine.match(/^([^\s]+)\s+REG_(?:SZ|EXPAND_SZ)\s+(.*)$/i)
        if (match) {
          const [, key, value] = match
          envVars[key] = value
        }
      }
      return envVars
    } else {
      return {}
    }
  } catch (error) {
    console.error('Failed to read user environment variables:', error)
    return {}
  }
}

function getSystemEnvVars(): Record<string, string> {
  try {
    if (process.platform === 'win32') {
      // Read system environment variables from registry
      const output = execSync('reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment"', {
        encoding: 'utf-8',
        windowsHide: true
      })
      const envVars: Record<string, string> = {}

      const lines = output.split('\n')
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Match: NAME    REG_TYPE    value
        const match = trimmedLine.match(/^([^\s]+)\s+REG_(?:SZ|EXPAND_SZ)\s+(.*)$/i)
        if (match) {
          const [, key, value] = match
          envVars[key] = value
        }
      }
      return envVars
    } else {
      return {}
    }
  } catch (error) {
    console.error('Failed to read system environment variables:', error)
    return {}
  }
}

function getAllEnvVars(): EnvVarWithType[] {
  const userVars = getUserEnvVars()
  const systemVars = getSystemEnvVars()
  const allVars: EnvVarWithType[] = []

  // Add user variables
  for (const [name, value] of Object.entries(userVars)) {
    allVars.push({ name, value, type: 'user' })
  }

  // Add system variables that are not in user variables
  for (const [name, value] of Object.entries(systemVars)) {
    if (!userVars[name]) {
      allVars.push({ name, value, type: 'system' })
    }
  }

  return allVars
}

function setUserEnvVar(name: string, value: string): boolean {
  try {
    if (process.platform === 'win32') {
      // Use setx command to set user environment variable
      // Note: setx has a limit of 1024 characters for values
      execSync(`setx ${name} "${value}"`, {
        encoding: 'utf-8',
        windowsHide: true
      })
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Failed to set user environment variable:', error)
    return false
  }
}

function deleteUserEnvVar(name: string): boolean {
  try {
    if (process.platform === 'win32') {
      execSync(`reg delete "HKCU\\Environment" /v ${name} /f`, {
        encoding: 'utf-8',
        windowsHide: true
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to delete user environment variable:', error)
    return false
  }
}

ipcMain.handle('system:get-env-vars', (): EnvVarWithType[] => {
  return getAllEnvVars()
})

ipcMain.handle('system:set-env-var', (_, name: string, value: string): boolean => {
  return setUserEnvVar(name, value)
})

ipcMain.handle('system:delete-env-var', (_, name: string): boolean => {
  return deleteUserEnvVar(name)
})

// Path Environment Variable Management
function getPathVar(type: 'user' | 'system'): string[] {
  try {
    if (process.platform !== 'win32') {
      return []
    }

    const registryPath = type === 'user'
      ? 'HKCU\\Environment'
      : 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment'

    const output = execSync(`reg query "${registryPath}" /v Path`, {
      encoding: 'utf-8',
      windowsHide: true
    })

    // Parse the Path value from reg output
    // Format: PATH    REG_EXPAND_SZ    value1;value2;value3
    const lines = output.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()
      const match = trimmedLine.match(/^Path\s+REG_(?:SZ|EXPAND_SZ)\s+(.*)$/i)
      if (match) {
        const pathValue = match[1]
        // Split by semicolon and filter out empty paths
        return pathValue.split(';').map(p => p.trim()).filter(p => p.length > 0)
      }
    }
    return []
  } catch (error) {
    // Path variable might not exist yet, return empty array
    console.log(`Path variable not found for ${type}:`, error)
    return []
  }
}

function setPathVar(paths: string[], type: 'user' | 'system'): boolean {
  try {
    if (process.platform !== 'win32') {
      return false
    }

    const pathValue = paths.join(';')
    const registryPath = type === 'user'
      ? 'HKCU\\Environment'
      : 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment'

    if (type === 'user') {
      // Use setx for user variables
      execSync(`setx Path "${pathValue}"`, {
        encoding: 'utf-8',
        windowsHide: true
      })
    } else {
      // Use reg add for system variables (requires admin)
      execSync(`reg add "${registryPath}" /v Path /t REG_EXPAND_SZ /d "${pathValue}" /f`, {
        encoding: 'utf-8',
        windowsHide: true
      })
    }
    return true
  } catch (error) {
    console.error(`Failed to set ${type} Path:`, error)
    return false
  }
}

function getMergedPaths(): PathEntry[] {
  const systemPaths = getPathVar('system')
  const userPaths = getPathVar('user')
  const merged: PathEntry[] = []

  // Add system paths first
  for (const path of systemPaths) {
    merged.push({ value: path, type: 'system' })
  }

  // Add user paths after
  for (const path of userPaths) {
    merged.push({ value: path, type: 'user' })
  }

  return merged
}

function addUserPath(path: string): boolean {
  const currentPaths = getPathVar('user')
  // Check for duplicates
  if (currentPaths.includes(path)) {
    return false
  }
  currentPaths.push(path)
  return setPathVar(currentPaths, 'user')
}

function removeUserPath(path: string): boolean {
  const currentPaths = getPathVar('user')
  const filteredPaths = currentPaths.filter(p => p !== path)
  if (filteredPaths.length === currentPaths.length) {
    return false // Path not found
  }
  return setPathVar(filteredPaths, 'user')
}

function moveUserPath(fromIndex: number, toIndex: number): boolean {
  const allPaths = getMergedPaths()
  const userPaths = allPaths.filter(p => p.type === 'user')

  if (fromIndex < 0 || fromIndex >= userPaths.length || toIndex < 0 || toIndex >= userPaths.length) {
    return false
  }

  // Move the path
  const [moved] = userPaths.splice(fromIndex, 1)
  userPaths.splice(toIndex, 0, moved)

  // Extract just the path values
  const newPathValues = userPaths.map(p => p.value)
  return setPathVar(newPathValues, 'user')
}

// IPC Handlers for Path Management
ipcMain.handle('system:get-paths', (): PathEntry[] => {
  return getMergedPaths()
})

ipcMain.handle('system:add-path', (_, path: string): boolean => {
  return addUserPath(path)
})

ipcMain.handle('system:remove-path', (_, path: string): boolean => {
  return removeUserPath(path)
})

ipcMain.handle('system:move-path', (_, fromIndex: number, toIndex: number): boolean => {
  return moveUserPath(fromIndex, toIndex)
})

// Window Management
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 900,
    minWidth: 600,
    minHeight: 700,
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
