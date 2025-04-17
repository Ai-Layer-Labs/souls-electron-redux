import React from "react"
import { useSetAtom } from "jotai"
import { keymapModalVisibleAtom } from "../atoms/modalState"
import ModelSelect from "./ModelSelect"
import { useUIStore } from "../stores/uiStore"

type Props = {
  showHelpButton?: boolean
  showModelSelect?: boolean
  showPanelToggleButton?: boolean
}

const Header = ({
  showHelpButton = false,
  showModelSelect = false,
  showPanelToggleButton = true,
}: Props) => {
  const setKeymapModalVisible = useSetAtom(keymapModalVisibleAtom)
  const { togglePanel } = useUIStore()
  const { isPanelOpen } = useUIStore()
  const shouldShowToggleButton = showPanelToggleButton && !isPanelOpen;

  return (
    <div className={`position-absolute left-0 z-10 transition-all duration-300 ease-in-out ${isPanelOpen ? 'w-calc(100% + 300px)' : 'w-full'}`}>
      <div className="mx-auto px-5 flex items-center justify-between gap-4 mt-[5px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 whitespace-nowrap">
            {showModelSelect && <ModelSelect />}
          </div>
        </div>
        <div className="flex items-center">
          {shouldShowToggleButton && (
            <button
              className="panel-toggle-btn bg-none border-none cursor-pointer p-2 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/10 hover:text-foreground"
              onClick={togglePanel}
              title={"Show Canvas"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
            </button>
          )}
          {showHelpButton && (
            <button
              className="bg-none border-none cursor-pointer p-2 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/10 hover:text-foreground"
              onMouseEnter={() => setKeymapModalVisible(true)}
              onMouseLeave={() => setKeymapModalVisible(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Header)