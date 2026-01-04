@echo off
chcp 936 >nul
title Claude Code Config Switcher

echo.
echo  ================================
echo    Claude Code Config Switcher
echo  ================================
echo.
echo  [1] foxcode (Opus 4.5 Thinking)
echo  [2] ohmycdn
echo  [3] GLM4.7
echo  [0] Exit
echo.

set /p choice=Select:

if "%choice%"=="1" goto foxcode
if "%choice%"=="2" goto ohmycdn
if "%choice%"=="3" goto GLM4.7
if "%choice%"=="0" goto END
goto END

:foxcode
set "settingsPath=%USERPROFILE%\.claude\settings.json"
echo {"env":{"DISABLE_TELEMETRY":"1","OTEL_METRICS_EXPORTER":"otlp","ANTHROPIC_AUTH_TOKEN":"sk-ant-oat01-s22Zss7GEkHdzy2nCSjN-GdnU1Iccrq1UaShJbO6YQzgSahRtT4TdgLhyFaiKghN7FfMnj8XB5YYclrfeFjhQSiV3YNsgAA","ANTHROPIC_BASE_URL":"https://code.newcli.com/claude/aws","CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":"1"},"includeCoAuthoredBy":false,"permissions":{"allow":[],"deny":[]},"model":"claude-opus-4-5-20251101-thinking"} > "%settingsPath%"
echo.
echo  [OK] Switched to foxcode
goto DONE

:ohmycdn
set "settingsPath=%USERPROFILE%\.claude\settings.json"
echo {"env":{"DISABLE_TELEMETRY":"1","OTEL_METRICS_EXPORTER":"otlp","ANTHROPIC_API_KEY":"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","ANTHROPIC_BASE_URL":"https://apic1.ohmycdn.com/api/v1/ai/openai/cc-omg/","CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":"1"},"includeCoAuthoredBy":false,"apiKeyHelper":"echo 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","permissions":{"allow":[],"deny":[]}} > "%settingsPath%"
echo.
echo  [OK] Switched to ohmycdn
goto DONE

:GLM4.7
set "settingsPath=%USERPROFILE%\.claude\settings.json"
echo {"env":{"DISABLE_TELEMETRY":"1","OTEL_METRICS_EXPORTER":"otlp","ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7","ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7","ANTHROPIC_API_KEY":"02f75809758443349f128c7b3e21edf1.B5g0orkqAB24jzDZ","ANTHROPIC_BASE_URL":"https://open.bigmodel.cn/api/anthropic","CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":"1"},"includeCoAuthoredBy":false,"permissions":{"allow":[],"deny":[]}} > "%settingsPath%"
echo.
echo  [OK] Switched to GLM4.7
goto DONE

:DONE
echo.
pause

:END
