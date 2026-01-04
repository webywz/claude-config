import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import type { ClaudeConfig, Presets } from './types'

export class ConfigManager {
  private configPath: string
  private presetsPath: string

  constructor() {
    this.configPath = join(homedir(), '.claude', 'settings.json')
    this.presetsPath = join(homedir(), '.claude_presets', 'presets.json')
  }

  load(): ClaudeConfig {
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf-8')
        return JSON.parse(content)
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }
    return this.getDefaultConfig()
  }

  save(config: ClaudeConfig): boolean {
    try {
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save config:', error)
      return false
    }
  }

  loadPresets(): Presets {
    if (existsSync(this.presetsPath)) {
      try {
        const content = readFileSync(this.presetsPath, 'utf-8')
        return JSON.parse(content)
      } catch (error) {
        console.error('Failed to load presets:', error)
      }
    }
    return {}
  }

  savePresets(presets: Presets): boolean {
    try {
      const dir = dirname(this.presetsPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.presetsPath, JSON.stringify(presets, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save presets:', error)
      return false
    }
  }

  getConfigPath(): string {
    return this.configPath
  }

  private getDefaultConfig(): ClaudeConfig {
    return {
      env: {},
      model: '',
      includeCoAuthoredBy: false,
      permissions: { allow: [], deny: [] }
    }
  }
}
