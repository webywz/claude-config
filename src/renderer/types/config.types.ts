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

declare global {
  interface Window {
    electronAPI: {
      config: {
        load: () => Promise<ClaudeConfig>
        save: (config: ClaudeConfig) => Promise<boolean>
      }
      presets: {
        load: () => Promise<Presets>
        save: (presets: Presets) => Promise<boolean>
        apply: (name: string) => Promise<{ success: boolean; config?: ClaudeConfig }>
        delete: (name: string) => Promise<boolean>
      }
      system: {
        openFolder: () => Promise<void>
        getConfigPath: () => Promise<string>
      }
    }
  }
}
