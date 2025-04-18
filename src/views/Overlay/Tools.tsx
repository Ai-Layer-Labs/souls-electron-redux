// @ts-ignore
import jsonlint from "jsonlint-mod"
import React, { useEffect, useState, useRef, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAtomValue, useSetAtom } from "jotai"
import { showToastAtom } from "../../atoms/toastState"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { linter, lintGutter, Diagnostic } from "@codemirror/lint"
import { systemThemeAtom, themeAtom } from "../../atoms/themeState"
import { closeOverlayAtom } from "../../atoms/layerState"
import Switch from "../../components/Switch"
import { Behavior, useLayer } from "../../hooks/useLayer"
import { loadToolsAtom, restoreDefaultToolsAtom, Tool, toolsAtom } from "../../atoms/toolState"
import Tooltip from "../../components/Tooltip"

interface ConfigModalProps {
  title: string
  subtitle?: string
  config?: Record<string, unknown>
  onSubmit: (config: Record<string, unknown>) => void
  onCancel: () => void
}

interface ToolsCache {
  [key: string]: {
    description: string
    icon?: string
    subTools: {
      name: string
      description: string
    }[]
    disabled: boolean
  }
}

interface McpServer {
  command?: string
  args?: string[]
  url?: string
  transport?: string
  enabled?: boolean
  disabled?: boolean
}

interface McpConfig extends Record<string, unknown> {
  mcpServers: Record<string, McpServer>
}

interface JsonLintError extends Error {
  message: string
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  title,
  subtitle,
  config,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation()
  const [jsonString, setJsonString] = useState(config ? JSON.stringify(config, null, 2) : "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const showToast = useSetAtom(showToastAtom)
  const [isFormatError, setIsFormatError] = useState(false)
  const theme = useAtomValue(themeAtom)
  const systemTheme = useAtomValue(systemThemeAtom)

  useLayer({
    onClose: () => {
      onCancel()
    },
    behavior: Behavior.autoPush
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let processedJsonString = jsonString.trim()
      if (!processedJsonString.startsWith("{")) {
        processedJsonString = `{${processedJsonString}}`
      }

      if (isFormatError)
        return

      const parsedConfig = JSON.parse(processedJsonString)
      setIsSubmitting(true)
      await onSubmit(parsedConfig)
    } catch (err) {
      if (err instanceof SyntaxError) {
        showToast({
          message: t("tools.invalidJson"),
          type: "error"
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJsonLint = (view: EditorView): Diagnostic[] => {
    const doc = view.state.doc.toString()
    if (!doc.trim())
      return []

    try {
      jsonlint.parse(doc)
      setIsFormatError(false)
      return []
    } catch (e) {
      const error = e as JsonLintError
      const lineMatch = error.message.match(/line\s+(\d+)/)
      const line = lineMatch ? parseInt(lineMatch[1]) : 1
      const linePos = view.state.doc.line(line)
      setIsFormatError(true)

      return [{
        from: linePos.from,
        to: linePos.to,
        message: error.message,
        severity: "error" as const
      }]
    }
  }

  const createJsonLinter = () => {
    return linter(handleJsonLint)
  }

  const inputTheme = EditorView.theme({
    '.cm-content': {
      color: 'var(--text)',
    },
    '.cm-lineNumbers': {
      color: 'var(--text)',
    },
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="close-btn"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="config-form">
          {subtitle && <p className="subtitle">{subtitle}</p>}
          <CodeMirror
            placeholder={"{\n \"mcpServer\":{}\n}"}
            theme={theme === 'system' ? systemTheme : theme}
            minHeight="300px"
            maxHeight="300px"
            value={jsonString}
            extensions={[
              json(),
              lintGutter(),
              createJsonLinter(),
              inputTheme
            ]}
            onChange={(value) => {
              if(!value.trim().startsWith("{")) {
                setJsonString(`{\n ${value}\n}`)
              }else{
                setJsonString(value)
              }
            }}
          />
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              {t("tools.cancel")}
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : t("tools.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Tools = () => {
  const { t } = useTranslation()
  const tools = useAtomValue(toolsAtom)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [mcpConfig, setMcpConfig] = useState<McpConfig>({ mcpServers: {} })
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const showToast = useSetAtom(showToastAtom)
  const closeOverlay = useSetAtom(closeOverlayAtom)
  const toolsCacheRef = useRef<ToolsCache>({})
  const loadTools = useSetAtom(loadToolsAtom)
  const restoreDefaultTools = useSetAtom(restoreDefaultToolsAtom)

  useEffect(() => {
    const cachedTools = localStorage.getItem("toolsCache")
    if (cachedTools) {
      toolsCacheRef.current = JSON.parse(cachedTools)
    }

    fetchTools()
    fetchMCPConfig()
  }, [])

  const fetchTools = async () => {
    try {
      const data = await loadTools()

      if (data.success) {
        const newCache: ToolsCache = {}
        data.tools.forEach((tool: Tool) => {
          newCache[tool.name] = {
            description: tool.description || '',
            icon: tool.icon,
            subTools: tool.tools?.map(subTool => ({
              name: subTool.name,
              description: subTool.description || ''
            })) || [],
            disabled: false
          }
        })

        toolsCacheRef.current = {...toolsCacheRef.current, ...newCache}
        localStorage.setItem("toolsCache", JSON.stringify(toolsCacheRef.current))
      } else {
        showToast({
          message: data.message || t("tools.fetchFailed"),
          type: "error"
        })
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : t("tools.fetchFailed"),
        type: "error"
      })
    }
  }

  const updateMCPConfig = async (newConfig: McpConfig | string, force = false) => {
    const config = typeof newConfig === "string" ? JSON.parse(newConfig) : newConfig
    Object.keys(config.mcpServers).forEach(key => {
      const cfg = config.mcpServers[key]
      if (cfg.url && !cfg.transport) {
        config.mcpServers[key].transport = "sse"
      }
    })

    return await fetch(`/api/config/mcpserver${force ? "?force=1" : ""}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })
      .then(async (response) => await response.json())
      .catch((error) => {
        showToast({
          message: error instanceof Error ? error.message : t("tools.configFetchFailed"),
          type: "error"
        })
      })
  }

  const fetchMCPConfig = async () => {
    try {
      const response = await fetch("/api/config/mcpserver")
      const data = await response.json()
      if (data.success) {
        setMcpConfig(data.config || {})
      } else {
        showToast({
          message: data.message || t("tools.configFetchFailed"),
          type: "error"
        })
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : t("tools.configFetchFailed"),
        type: "error"
      })
    }
  }

  const handleUpdateConfigResponse = (data: { errors: { error: string; serverName: string }[] }) => {
    if (data.errors && data.errors.length && Array.isArray(data.errors)) {
      data.errors.forEach(({ error, serverName }: { error: string; serverName: string }) => {
        showToast({
          message: t("tools.updateFailed", { serverName, error }),
          type: "error",
          closable: true
        })
        setMcpConfig(prevConfig => {
          const newConfig = {...prevConfig}
          newConfig.mcpServers[serverName].disabled = true
          return newConfig
        })
      })
    } else {
      showToast({
        message: t("tools.saveSuccess"),
        type: "success"
      })
    }
  }

  const handleConfigSubmit = async (newConfig: Record<string, unknown>) => {
    try {
      const filledConfig = await window.electron.ipcRenderer.fillPathToConfig(JSON.stringify(newConfig))
      const data = await updateMCPConfig(filledConfig)
      if (data.success) {
        setMcpConfig(newConfig as McpConfig)
        setShowConfigModal(false)
        fetchTools()
        handleUpdateConfigResponse(data)
      }
    } catch (error) {
      console.error("Failed to update MCP config:", error)
      showToast({
        message: t("tools.saveFailed"),
        type: "error"
      })
    }
  }

  const toggleTool = async (tool: Tool) => {
    try {
      setIsLoading(true)
      const currentEnabled = tool.enabled

      const newConfig: McpConfig = {
        mcpServers: {
          ...mcpConfig.mcpServers,
          [tool.name]: {
            ...mcpConfig.mcpServers[tool.name],
            enabled: !currentEnabled
          }
        }
      }

      const data = await updateMCPConfig(newConfig)
      if (data.errors && Array.isArray(data.errors) && data.errors.length) {
        data.errors
          .map((e: { serverName: string }) => e.serverName)
          .forEach((serverName: string) => {
            newConfig.mcpServers[serverName] = {
              ...newConfig.mcpServers[serverName],
              enabled: false,
              disabled: true
            }
          })

        // reset enable
        await updateMCPConfig(newConfig)
      }

      if (data.success) {
        setMcpConfig(newConfig)
        await fetchTools()
        handleUpdateConfigResponse(data)
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : t("tools.toggleFailed"),
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleToolSection = (index: number) => {
    const toolElement = document.getElementById(`tool-${index}`)
    toolElement?.classList.toggle("expanded")
  }

  const handleReloadMCPServers = async () => {
    setIsLoading(true)
    await updateMCPConfig(mcpConfig, true)
    setIsLoading(false)
  }

  const handleOpenConfigFolder = async () => {
    window.electron.ipcRenderer.openScriptsDir()
  }

  const handleAddSubmit = async (newConfig: Record<string, unknown>) => {
    const mergedConfig = mcpConfig as McpConfig
    const configKeys = Object.keys(newConfig)
    if (configKeys.includes("mcpServers")) {
      const newMcpServers = newConfig.mcpServers as Record<string, McpServer>
      mergedConfig.mcpServers = { ...mergedConfig.mcpServers, ...newMcpServers }
    }

    mergedConfig.mcpServers = configKeys.reduce<Record<string, McpServer>>((acc, key) => {
      const server = newConfig[key] as McpServer
      if (("command" in server && "args" in server) || "url" in server) {
        acc[key] = { ...(mergedConfig.mcpServers[key] || {}), ...server }
      }
      return acc
    }, mergedConfig.mcpServers)

    mergedConfig.mcpServers = Object.keys(mergedConfig.mcpServers).reduce<Record<string, McpServer>>((acc, key) => {
      const server = acc[key]
      if (!("enabled" in server)) {
        server.enabled = true
      }
      return acc
    }, mergedConfig.mcpServers)

    await handleConfigSubmit(mergedConfig)
    setShowAddModal(false)
  }

  const onClose = () => {
    closeOverlay("Tools")
  }

  const sortedTools = useMemo(() => {
    const configOrder = mcpConfig.mcpServers ? Object.keys(mcpConfig.mcpServers) : []
    const toolMap = new Map(tools.map(tool => [tool.name, tool]))

    return configOrder.map(name => {
      if (toolMap.has(name)) {
        return toolMap.get(name)!
      }

      const cachedTool = toolsCacheRef.current[name]
      if (cachedTool) {
        return {
          name,
          description: cachedTool.description,
          icon: cachedTool.icon,
          enabled: false,
          tools: cachedTool.subTools.map(subTool => ({
            name: subTool.name,
            description: subTool.description,
            enabled: false
          })),
          disabled: mcpConfig.mcpServers[name]?.disabled ?? false,
        }
      }

      return {
        name,
        description: "",
        enabled: false,
        disabled: mcpConfig.mcpServers[name]?.disabled ?? false,
      }
    })
  }, [tools, mcpConfig.mcpServers])

  const handleRestoreDefaults = async () => {
    setIsLoading(true)
    try {
      const result = await restoreDefaultTools()
      if (result.success) {
        showToast({
          message: t("tools.restoreSuccess"),
          type: "success"
        })
      } else {
        showToast({
          message: result.message || t("tools.restoreFailed"),
          type: "error"
        })
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : t("tools.restoreFailed"),
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tools-page overlay-page">
      <button
        className="close-btn"
        onClick={onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="tools-container">
        <div className="tools-header">
          <div>
            <h1>{t("tools.title")}</h1>
            <p className="subtitle">{t("tools.subtitle")}</p>
          </div>
          <div className="header-actions">
            <Tooltip content={t("tools.addServer.alt")}>
              <button
                className="add-btn"
                onClick={() => setShowAddModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                {t("tools.addServer")}
              </button>
            </Tooltip>

            <Tooltip content={t("tools.editConfig.alt")}>
              <button
                className="edit-btn"
                onClick={() => setShowConfigModal(true)}
              >
                {t("tools.editConfig")}
              </button>
            </Tooltip>

            <Tooltip content={t("tools.openConfigFolder.alt")}>
              <button
                className="folder-btn"
                onClick={handleOpenConfigFolder}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
                </svg>
                {t("tools.openConfigFolder")}
              </button>
            </Tooltip>

            <Tooltip content={t("tools.reloadMCPServers.alt")}>
              <button
                className="reload-btn"
                onClick={handleReloadMCPServers}
              >
                <img src={"img://reload.svg"} />
              </button>
            </Tooltip>

            <Tooltip content={t("tools.restoreDefaults.alt")}>
              <button
                className="restore-btn"
                onClick={handleRestoreDefaults}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                {t("tools.restoreDefaults")}
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="tools-list">
          {sortedTools.map((tool, index) => (
            <div key={index} id={`tool-${index}`} onClick={() => !tool.disabled && toggleToolSection(index)} className={`tool-section ${tool.disabled ? "disabled" : ""}`}>
              <div className="tool-header">
                <div className="tool-header-content">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                  </svg>
                  <span className="tool-name">
                    {tool.name}
                    {tool.isBuiltIn && (
                      <Tooltip content={t("tools.builtIn.alt")}>
                        <span className="built-in-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                          </svg>
                        </span>
                      </Tooltip>
                    )}
                  </span>
                </div>
                <div className="tool-switch-container">
                  <Switch
                    checked={tool.enabled}
                    onChange={() => toggleTool(tool)}
                  />
                </div>
                {tool.disabled ?
                  <Tooltip
                    content={t("tools.installFailed")}
                  >
                    <span className="tool-toggle disabled">
                      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <line x1="12" y1="6" x2="12" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
                      </svg>
                    </span>
                  </Tooltip>
                :
                  <span className="tool-toggle">▼</span>
                }
              </div>
              <div className="tool-content">
                {tool.description && (
                  <div className="tool-description">{tool.description}</div>
                )}
                {tool.tools && (
                  <div className="sub-tools">
                    {tool.tools.map((subTool, subIndex) => (
                      <div key={subIndex} className="sub-tool">
                        <div className="sub-tool-content">
                          <div className="sub-tool-name">{subTool.name}</div>
                          {subTool.description && (
                            <div className="sub-tool-description">
                              {subTool.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="global-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {showConfigModal && (
        <ConfigModal
          title={t("tools.configTitle")}
          config={mcpConfig}
          onSubmit={handleConfigSubmit}
          onCancel={() => setShowConfigModal(false)}
        />
      )}

      {showAddModal && (
        <ConfigModal
          title={t("tools.addServerTitle")}
          subtitle={t("tools.addServerSubtitle")}
          onSubmit={handleAddSubmit}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

export default React.memo(Tools)