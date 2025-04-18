import React from "react"
import PopupWindow from "../../components/PopupWindow"
import Model from "./Model"
import System from "./System"
import { useAtomValue } from "jotai"
import { overlaysAtom } from "../../atoms/layerState"
import { KnowledgeBase } from "../../components/KnowledgeBase"

const Overlay = () => {
  const overlays = useAtomValue(overlaysAtom)

  if (!overlays.length)
    return null

  return (
    <>
      {overlays.map((overlay, index) => {
        switch (overlay) {
          case "Model":
            return (
              <PopupWindow key={`model-${index}`} overlay>
                <Model />
              </PopupWindow>
            )
          case "System":
            return (
              <PopupWindow key={`system-${index}`} overlay>
                <System />
              </PopupWindow>
            )
          case "Knowledge":
            return (
              <PopupWindow key={`knowledge-${index}`} overlay>
                <KnowledgeBase />
              </PopupWindow>
            )
          default:
            console.warn("Unhandled overlay type:", overlay)
            return null
        }
      })}
    </>
  )
}

export default React.memo(Overlay)
