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

// Installer Types
export interface ToolInstallInfo {
  installed: boolean
  version?: string
  path?: string
  error?: string
}

export type InstallStep =
  | 'checking'
  | 'downloading'
  | 'installing'
  | 'configuring'
  | 'verifying'
  | 'completed'
  | 'failed'

export interface InstallProgress {
  toolId: string
  step: InstallStep
  progress: number
  message: string
}

// Note: ElectronAPI type is defined in electron/config/types.ts
// and Window.electronAPI is declared in env.d.ts
