import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import * as toml from 'smol-toml'
import type { CodexConfig, CodexAuth } from './types'

export class CodexConfigManager {
  private configPath: string
  private authPath: string

  constructor() {
    this.configPath = join(homedir(), '.codex', 'config.toml')
    this.authPath = join(homedir(), '.codex', 'auth.json')
  }

  loadConfig(): CodexConfig {
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf-8')
        const parsed = toml.parse(content) as CodexConfig
        return this.normalizeConfig(parsed)
      } catch (error) {
        console.error('Failed to load Codex config:', error)
      }
    }
    return this.getDefaultConfig()
  }

  saveConfig(config: CodexConfig): boolean {
    try {
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      const normalized = this.normalizeConfig(config)
      const tomlContent = toml.stringify(normalized)
      writeFileSync(this.configPath, tomlContent, 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save Codex config:', error)
      return false
    }
  }

  loadAuth(): CodexAuth {
    if (existsSync(this.authPath)) {
      try {
        const content = readFileSync(this.authPath, 'utf-8')
        return JSON.parse(content)
      } catch (error) {
        console.error('Failed to load Codex auth:', error)
      }
    }
    return {}
  }

  saveAuth(auth: CodexAuth): boolean {
    try {
      const dir = dirname(this.authPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.authPath, JSON.stringify(auth, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save Codex auth:', error)
      return false
    }
  }

  getConfigPath(): string {
    return this.configPath
  }

  getAuthPath(): string {
    return this.authPath
  }

  private getDefaultConfig(): CodexConfig {
    return {
      model_provider: 'openai',
      model: 'gpt-4',
      model_providers: {
        openai: {
          base_url: ''
        }
      }
    }
  }

  private normalizeConfig(config: CodexConfig): CodexConfig {
    const cloned = JSON.parse(JSON.stringify(config || {})) as CodexConfig
    const providers = cloned.model_providers || {}

    const activeProvider = cloned.model_provider
    if (!cloned.model && activeProvider && providers[activeProvider]?.model) {
      cloned.model = providers[activeProvider].model
    }

    for (const providerName of Object.keys(providers)) {
      const provider = providers[providerName] || {}
      const legacyApiBase = (provider as any).api_base
      if (legacyApiBase && !provider.base_url) {
        provider.base_url = legacyApiBase
      }
      if ((provider as any).api_base !== undefined) {
        delete (provider as any).api_base
      }
      if ((provider as any).model !== undefined) {
        delete (provider as any).model
      }
      providers[providerName] = provider
    }

    cloned.model_providers = providers
    return cloned
  }
}
