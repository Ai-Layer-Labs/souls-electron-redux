import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./styles/index.scss"
import App from "./App.tsx"
import "./i18n"
import { HeroUIProvider } from "@heroui/react";

if (window.electron.ipcRenderer) {
  const originalFetch = window.fetch
  let port: number | null = null
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input !== "string" || (typeof input === "string" && !input.startsWith("/api"))) {
      return originalFetch(input, init)
    }

    port = port ?? (await window.electron.ipcRenderer.port())
    return originalFetch(`http://localhost:${port}${input}`, init)
  }

  window.PLATFORM = await window.electron.ipcRenderer.getPlatform() as "darwin" | "win32" | "linux"
}

window.addEventListener('contextmenu', (e) => {
  // e.preventDefault()
  const selection = window.getSelection()?.toString()

  if (selection) {
    window.electron.ipcRenderer.showSelectionContextMenu()
  }
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider className="h-full w-full">
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
