# Claude Config - Electron

一个使用 Electron + Vue 3 + TypeScript 构建的 Claude Code 配置管理桌面应用，支持 Windows 和 macOS。

## 功能

- API Token 配置（支持显示/隐藏切换）
- API URL 自定义配置
- Claude 模型选择（支持多个版本）
- 选项开关：
  - 禁用遥测数据收集
  - 禁用非必要网络请求
  - 提交时包含 Co-authored-by
- 配置预设管理（保存、应用、删除）
- 打开配置文件目录

## 技术栈

- **桌面框架**: Electron ^32.0.0
- **前端框架**: Vue 3 ^3.5.0
- **语言**: TypeScript ^5.6.0
- **构建工具**: Vite ^5.4.0 + electron-vite ^2.3.0
- **打包工具**: electron-builder ^25.0.0
- **UI 组件库**: Element Plus ^2.8.0
- **状态管理**: Pinia ^2.2.0
- **样式**: SCSS

## 项目结构

```
claude-config-electron/
├── electron/              # 主进程代码
│   ├── main/             # 主进程入口
│   └── preload/          # 预加载脚本
├── src/                  # 渲染进程代码 (Vue 3)
│   └── renderer/         # Vue 应用
│       ├── main.ts       # Vue 入口
│       ├── App.vue       # 根组件
│       ├── components/   # Vue 组件
│       ├── stores/       # Pinia 状态管理
│       ├── composables/  # Vue 组合式函数
│       ├── types/        # TypeScript 类型
│       └── assets/       # 静态资源
├── out/                  # 构建输出
├── release/              # 打包输出
└── package.json
```

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 打包

打包 Windows 版本：
```bash
npm run build:win
```

打包 macOS 版本：
```bash
npm run build:mac
```

打包所有平台：
```bash
npm run build:all
```

## 配置文件位置

- 主配置: `~/.claude/settings.json`
- 预设配置: `~/.claude_presets/presets.json`
- Codex 配置: `~/.codex/config.toml`
- Codex Auth: `~/.codex/auth.json`
- Codex 预设配置: `~/.codex_presets/presets.json`

## 界面预览

应用采用深色主题设计，参考了 GitHub 的深色模式配色方案。

## 许可证

MIT
