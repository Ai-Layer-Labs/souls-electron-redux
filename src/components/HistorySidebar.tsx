import React, { useState, useCallback, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { historiesAtom, loadHistoriesAtom } from "../atoms/historyState"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import { showToastAtom } from "../atoms/toastState"
import Tooltip from "./Tooltip"
import { closeAllOverlaysAtom, openOverlayAtom, OverlayType } from "../atoms/layerState"
import { useSidebarLayer } from "../hooks/useLayer"
import useHotkeyEvent from "../hooks/useHotkeyEvent"
import { currentChatIdAtom } from "../atoms/chatState"
import PopupConfirm from "./PopupConfirm"
import { newVersionAtom } from "../atoms/globalState"
import UpdateButton from "./UpdateButton"
import soulsLogo from "../assets/Souls_Logo_Gradient.png"
import soulsIcon from "../assets/souls-icon.svg"
import { useSidebarStore } from "../stores/sidebarStore"

// Define a union type for the button properties
type FooterButton =
  | { path: string; label: string; icon: React.ReactElement; handler?: never } // Link button
  | { handler: () => void; label: string; icon: React.ReactElement; path?: never }; // Action button

interface Props {
  onNewChat?: () => void
}

interface DeleteConfirmProps {
  onConfirm: () => void
  onCancel: () => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation()
  const setCurrentChatId = useSetAtom(currentChatIdAtom)

  const _onConfirm = useCallback(() => {
    onConfirm()
    setCurrentChatId("")
  }, [onConfirm, setCurrentChatId])

  return (
    <PopupConfirm
      title={t("chat.confirmDelete")}
      confirmText={t("common.confirm")}
      cancelText={t("common.cancel")}
      onConfirm={_onConfirm}
      onCancel={onCancel}
      onClickOutside={onCancel}
      noBorder
      footerType="center"
      zIndex={1000}
    />
  )
}

const HistorySidebar = ({ onNewChat }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const histories = useAtomValue(historiesAtom)
  const loadHistories = useSetAtom(loadHistoriesAtom)
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
  const showToast = useSetAtom(showToastAtom)
  const _openOverlay = useSetAtom(openOverlayAtom)
  const newVersion = useAtomValue(newVersionAtom)
  const [currentChatId, setCurrentChatId] = useAtom(currentChatIdAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const { collapsed, toggleSidebar } = useSidebarStore()

  useEffect(() => {
    loadHistories()
  }, [loadHistories])

  useHotkeyEvent("chat:delete", () => {
    currentChatId && setDeletingChatId(currentChatId)
  })

  const confirmDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    setDeletingChatId(chatId)
  }

  const handleDelete = async () => {
    if (!deletingChatId)
      return

    try {
      const response = await fetch(`/api/chat/${deletingChatId}`, {
        method: "DELETE"
      })
      const data = await response.json()

      if (data.success) {
        showToast({
          message: t("chat.deleteSuccess"),
          type: "success"
        })

        if (location.pathname.includes(`/chat/${deletingChatId}`)) {
          navigate("/")
        }

        loadHistories()
      } else {
        showToast({
          message: t("chat.deleteFailed"),
          type: "error"
        })
      }
    } catch (error) {
      showToast({
        message: t("chat.deleteFailed"),
        type: "error"
      })
    } finally {
      setDeletingChatId(null)
    }
  }

  const loadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    navigate(`/chat/${chatId}`)
  }, [navigate, setCurrentChatId])

  const handleNewChat = () => {
    setCurrentChatId("")
    if (onNewChat) {
      onNewChat()
    } else {
      navigate("/")
    }
  }

  // Apply the defined type to the array
  const footerButtons: FooterButton[] = [
    { label: t("sidebar.knowledge"), path: "/knowledge-base", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5.804v-10A7.968 7.968 0 0014.5 4z"></path></svg> },
    { label: t("sidebar.personas"), path: "/personas", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg> },
    { label: t("sidebar.storage"), path: "/storage", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 2l7.997 3.884v9.232l-7.997 3.884-7.997-3.884V5.884zM11 13h4v-2h-4v2zm-6 0h4v-2H5v2zm0-4h4V7H5v2zm6 0h4V7h-4v2z"></path></svg> },
    { label: t("sidebar.tools"), path: "/tools", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V6.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 8v9zM5 17a1 1 0 001.447.894l4-2A1 1 0 0011 15V6.236a1 1 0 00-1.447-.894l-4 2A1 1 0 005 8v9z"></path></svg> },
    { label: t("sidebar.system"), path: "/settings/system", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
    { label: t("sidebar.models"), path: "/settings/model", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg> },
  ]

  return (
    <>
      <div
        className={`flex flex-col h-screen text-default-200 border-r border-default-100 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'
          }`}
        ref={containerRef}
      >
        <div className={`flex items-center justify-center h-16 px-4 flex-shrink-0 ${collapsed ? '' : 'mb-4'}`}>
          <img
            src={collapsed ? soulsIcon : soulsLogo}
            alt="Souls Logo"
            className={`transition-opacity duration-300 ${collapsed ? 'h-8 w-8' : 'h-10 max-w-full'}`}
          />
        </div>
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-4 space-y-2">
          {histories.map(chat => (
            <div
              key={chat.id}
              className={`group flex items-center rounded-md cursor-pointer transition-colors duration-150 ${chat.id === currentChatId
                ? 'bg-default-900/30'
                : 'hover:bg-default-900/10'
                } ${collapsed ? 'justify-center h-12' : 'justify-between p-3'}`}
              onClick={() => loadChat(chat.id)}
              title={collapsed ? (chat.title || t("chat.untitledChat")) : undefined}
            >
              {!collapsed && (
                <div className="flex-1 min-w-0 mr-2">
                  <div className="text-sm font-medium text-default-200 truncate">
                    {chat.title || t("chat.untitledChat")}
                  </div>
                  <div className="text-xs text-default-100">
                    {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
              <button
                className={`flex-shrink-0 text-default-200 hover:text-default-100 transition-opacity duration-150 ${collapsed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } ${!collapsed ? 'p-1' : ''}`}
                onClick={(e) => confirmDelete(e, chat.id)}
                title={t("chat.deleteChat")}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          ))}
        </div>
        <div className={`flex-shrink-0 p-3 border-t border-default-100 mt-auto ${collapsed ? 'space-y-3' : 'space-y-2'}`}>
          <button
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 ${collapsed ? 'justify-center h-10' : ''}`}
            onClick={handleNewChat}
            title={collapsed ? t("chat.newChat") : undefined}
          >
            <svg className={`w-5 h-5 ${!collapsed ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {!collapsed && <span>{t("chat.newChat")}</span>}
          </button>
          {footerButtons.map((item, index) => (
            item.path ? (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-default-200 hover:bg-black/10 hover:text-white transition-colors duration-150 ${collapsed ? 'justify-center h-10' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${!collapsed ? 'mr-2' : ''}`}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                key={index}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-default-200 hover:bg-black/10 hover:text-white transition-colors duration-150 ${collapsed ? 'justify-center h-10' : ''}`}
                onClick={item.handler}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${!collapsed ? 'mr-2' : ''}`}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          ))}
          <div className={`${collapsed ? 'flex justify-center' : ''} pt-1`}>
            <UpdateButton />
          </div>
          <button
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-default-200 hover:bg-black/10 hover:text-default-100 transition-colors duration-150 mt-1 ${collapsed ? 'justify-center h-10' : ''}`}
            onClick={toggleSidebar}
            title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!collapsed && <span className="ml-2">{collapsed ? t("sidebar.expand") : t("sidebar.collapse")}</span>}
          </button>
        </div>
      </div>
      {deletingChatId && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeletingChatId(null)}
        />
      )}
    </>
  )
}

export default React.memo(HistorySidebar)