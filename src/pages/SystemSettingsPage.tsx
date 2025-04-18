import { useAtom } from "jotai"
import { useTranslation } from "react-i18next"
import Select from "../components/Select"
import React, { useState, useEffect } from "react"

import ThemeSwitch from "../components/ThemeSwitch"
import Switch from "../components/Switch"
import { getAutoDownload, setAutoDownload as _setAutoDownload } from "../updater"

const SystemSettingsPage = () => {
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language)
  const [autoDownload, setAutoDownload] = useState(false)
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [minimalToTray, setMinimalToTray] = useState(false)

  useEffect(() => {
    window.electron.ipcRenderer.getAutoLaunch().then(setAutoLaunch)
    window.electron.ipcRenderer.getMinimalToTray().then(setMinimalToTray)
    setAutoDownload(getAutoDownload())
  }, [])

  const handleAutoLaunchChange = (value: boolean) => {
    setAutoLaunch(value)
    window.electron.ipcRenderer.setAutoLaunch(value)
  }

  const languageOptions = [
    { label: "繁體中文", value: "zh-TW" },
    { label: "简体中文", value: "zh-CN" },
    { label: "English", value: "en" },
    { label: "Español", value: "es" },
  ]

  const handleLanguageChange = async (value: string) => {
    setLanguage(value)
    await i18n.changeLanguage(value)
    setDefaultInstructions()
  }

  const setDefaultInstructions = async () => {
    try {
      const response = await fetch("/api/config/customrules")
      const data = await response.json()
      if (data.success && data.rules === "") {
        const defaultInstructionForLang = t("system.defaultInstructions", { lng: language });
        if (data.rules !== defaultInstructionForLang) {
          await fetch("/api/config/customrules", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: defaultInstructionForLang
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch/set default custom rules:", error)
    }
  }

  const handleMinimalToTrayChange = (value: boolean) => {
    setMinimalToTray(value)
    window.electron.ipcRenderer.setMinimalToTray(value)
  }

  return (
    <div className="system-settings-container max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
          <span className="font-medium">{t("system.language")}:</span>
          <Select
            options={languageOptions}
            value={language}
            onSelect={(value) => handleLanguageChange(value)}
            align="end"
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
          <span className="font-medium">{t("system.theme")}:</span>
          <ThemeSwitch />
        </div>

        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
          <span className="font-medium">{t("system.autoDownload")}:</span>
          <Switch
            checked={autoDownload}
            onChange={(e) => {
              setAutoDownload(e.target.checked)
              _setAutoDownload(e.target.checked)
            }}
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
          <span className="font-medium">{t("system.autoLaunch")}:</span>
          <Switch
            checked={autoLaunch}
            onChange={e => handleAutoLaunchChange(e.target.checked)}
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
          <span className="font-medium">{t("system.minimalToTray")}:</span>
          <Switch
            checked={minimalToTray}
            onChange={e => handleMinimalToTrayChange(e.target.checked)}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(SystemSettingsPage)