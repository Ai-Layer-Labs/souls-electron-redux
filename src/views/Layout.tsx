import React from "react"
import { Outlet } from "react-router-dom"
import HistorySidebar from "../components/HistorySidebar"
import Header from "../components/Header"
import { useAtom, useAtomValue } from "jotai"
import { isConfigNotInitializedAtom } from "../atoms/configState"
import GlobalToast from "../components/GlobalToast"
import { themeAtom, systemThemeAtom } from "../atoms/themeState"
import Overlay from "./Overlay"
import KeymapModal from "../components/Modal/KeymapModal"
import CodeModal from "./Chat/CodeModal"
import { useUIStore } from "../stores/uiStore"

const Layout = () => {
  const isConfigNotInitialized = useAtomValue(isConfigNotInitializedAtom)
  const [theme] = useAtom(themeAtom)
  const [systemTheme] = useAtom(systemThemeAtom)
  const { isPanelOpen } = useUIStore()

  const sidebarWidth = 300;

  return (
    <div className="app-container flex h-screen" data-theme={theme === "system" ? systemTheme : theme}>
      <div className="app-content flex flex-1 overflow-hidden">
        {!isConfigNotInitialized && <HistorySidebar />}
        <div
          className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out ${isPanelOpen ? 'ml-[${sidebarWidth}px]' : 'ml-0'
            }`}
        >
          {!isConfigNotInitialized && <Header showModelSelect />}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
        <CodeModal />
      </div>
      <Overlay />
      <GlobalToast />
      <KeymapModal />
    </div>
  )
}

export default React.memo(Layout)
