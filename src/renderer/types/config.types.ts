export interface ClaudeConfig {
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

export interface Presets {
  [key: string]: ClaudeConfig
}

export interface PathEntry {
  value: string
  type: 'user' | 'system'
}

export interface CodexConfig {
  model_provider: string
  model?: string
  model_reasoning_effort?: string
  disable_response_storage?: boolean
  model_providers: {
    [key: string]: {
      base_url?: string
      api_key?: string
      [key: string]: any
    }
  }
}

export interface CodexAuth {
  [key: string]: string
}

export interface CodexPresets {
  [key: string]: CodexConfig
}

declare global {
  interface Window {
    electronAPI: {
      config: {
        load: () => Promise<ClaudeConfig>
        save: (config: ClaudeConfig) => Promise<boolean>
      }
      codex: {
        loadConfig: () => Promise<CodexConfig>
        saveConfig: (config: CodexConfig) => Promise<boolean>
        loadAuth: () => Promise<CodexAuth>
        saveAuth: (auth: CodexAuth) => Promise<boolean>
        getConfigPath: () => Promise<string>
        getAuthPath: () => Promise<string>
        getConfigRaw: () => Promise<string>
        loadPresets: () => Promise<CodexPresets>
        savePresets: (presets: CodexPresets) => Promise<boolean>
        applyPreset: (name: string) => Promise<{ success: boolean; config?: CodexConfig }>
        deletePreset: (name: string) => Promise<boolean>
      }
      presets: {
        load: () => Promise<Presets>
        save: (presets: Presets) => Promise<boolean>
        apply: (name: string) => Promise<{ success: boolean; config?: ClaudeConfig }>
        delete: (name: string) => Promise<boolean>
      }
      system: {
        openFolder: () => Promise<void>
        openCodexFolder: () => Promise<void>
        getConfigPath: () => Promise<string>
        getEnvVars: () => Promise<Array<{ name: string; value: string; type: 'user' | 'system' }>>
        setEnvVar: (name: string, value: string) => Promise<boolean>
        deleteEnvVar: (name: string) => Promise<boolean>
        getPaths: () => Promise<PathEntry[]>
        addPath: (path: string) => Promise<boolean>
        removePath: (path: string) => Promise<boolean>
        movePath: (fromIndex: number, toIndex: number) => Promise<boolean>
      }
    }
  }
}
