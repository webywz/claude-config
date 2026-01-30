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

// Codex Configuration Types
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

export interface ElectronAPI {
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
    openPath: (path: string) => Promise<string>
    getConfigPath: () => Promise<string>
    getEnvVars: () => Promise<Array<{ name: string; value: string; type: 'user' | 'system' }>>
    setEnvVar: (name: string, value: string) => Promise<boolean>
    deleteEnvVar: (name: string) => Promise<boolean>
    getPaths: () => Promise<PathEntry[]>
    addPath: (path: string) => Promise<boolean>
    removePath: (path: string) => Promise<boolean>
    movePath: (fromIndex: number, toIndex: number) => Promise<boolean>
    showOpenDialog: (options: any) => Promise<any>
  }
  installer: {
    checkTool: (toolId: string) => Promise<ToolInstallInfo>
    checkAllTools: () => Promise<Record<string, ToolInstallInfo>>
    downloadTool: (toolId: string) => Promise<string>
    installTool: (toolId: string, installerPath: string) => Promise<boolean>
    configureToolEnv: (toolId: string, toolPath: string) => Promise<boolean>
    verifyInstallation: (toolId: string) => Promise<boolean>
    cancelInstallation: (toolId: string) => Promise<void>
  }
  skills: {
    scan: () => Promise<SkillScanResult>
    sync: (targets: SkillProvider[] | 'all') => Promise<{ success: boolean; message: string }>
    getPaths: () => Promise<Record<SkillProvider, string>>
    create: (input: SkillCreateInput) => Promise<{ success: boolean; message: string }>
    delete: (skillName: string) => Promise<{ success: boolean; message: string }>
    import: (filePath: string, targetProviders: SkillProvider[]) => Promise<{ success: boolean; message: string }>
  }
  webUtils: {
    getPathForFile: (file: File) => string
  }
}

// Skills Types
export type SkillProvider = 'claude' | 'codex' | 'gemini' | 'antigravity' | 'trae'

export interface Skill {
  name: string
  path: string
  description: string
  provider: SkillProvider
}

export interface SkillCreateInput {
  name: string
  description?: string
  providers: SkillProvider[]
}

export interface SkillScanResult {
  providers: Record<SkillProvider, Skill[]>
  allSkills: string[]
}
