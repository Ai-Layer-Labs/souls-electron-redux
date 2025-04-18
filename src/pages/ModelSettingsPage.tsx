import { useAtomValue, useSetAtom } from "jotai"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Switch from "../components/Switch"
import PopupConfirm from "../components/PopupConfirm"
import { MultiModelConfig } from "../atoms/configState"
import KeyPopup from "../views/Overlay/Model/KeyPopup"
import ModelPopup from "../views/Overlay/Model/Popup"
import ParameterPopup from "../views/Overlay/Model/ParameterPopup"
import { useModelsProvider } from "../views/Overlay/Model/ModelsProvider"
import { showToastAtom } from "../atoms/toastState"
import { InterfaceProvider, PROVIDER_ICONS, PROVIDER_LABELS } from "../atoms/interfaceState"
import { getVerifyStatus } from "../views/Overlay/Model/ModelVerify"
import Dropdown from "../components/DropDown"
import Tooltip from "../components/Tooltip"
import KeyPopupEdit from "../views/Overlay/Model/KeyPopupEdit"
import { systemThemeAtom, userThemeAtom } from "../atoms/themeState"
import ModelsProvider from "../views/Overlay/Model/ModelsProvider"

const ModelSettingsPageContent = () => {
  const { t } = useTranslation()
  const [showDelete, setShowDelete] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [showKeyPopup, setShowKeyPopup] = useState(false)
  const [showKeyPopupEdit, setShowKeyPopupEdit] = useState(false)
  const [defaultModel, setDefaultModel] = useState("")
  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showNoModelAlert, setShowNoModelAlert] = useState(false)
  const [showParameterPopup, setShowParameterPopup] = useState(false)
  const showToast = useSetAtom(showToastAtom)
  const systemTheme = useAtomValue(systemThemeAtom)
  const userTheme = useAtomValue(userThemeAtom)

  const { multiModelConfigList, setMultiModelConfigList,
    currentIndex, setCurrentIndex, saveConfig
  } = useModelsProvider()

  const saveMultiModelConfigChanges = async (newMultiModelConfigList: MultiModelConfig[]) => {
    const _multiModelConfigList = JSON.parse(JSON.stringify(multiModelConfigList))
    try {
      const _activeProvider = newMultiModelConfigList.filter((config: MultiModelConfig) => config.active && config.models.length > 0).length === 0 ? "none" : undefined
      setMultiModelConfigList(newMultiModelConfigList)
      const data = await saveConfig(_activeProvider as InterfaceProvider)
      if (data.success) {
        showToast({
          message: t("setup.saveSuccess"),
          type: "success"
        })
      } else {
        showToast({
          message: data.error ?? t("setup.saveFailed"),
          type: "error"
        })
        setMultiModelConfigList(_multiModelConfigList)
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      setMultiModelConfigList(_multiModelConfigList)
    }
  }

  const handleMultiModelConfigChange = async (index: number, key: keyof MultiModelConfig, value: MultiModelConfig[keyof MultiModelConfig]) => {
    const newMultiModelConfigList = JSON.parse(JSON.stringify(multiModelConfigList)) ?? []
    setCurrentIndex(index)

    if (!value && isNoModelAlert(index)) {
      setShowClose(true)
    } else {
      newMultiModelConfigList[index][key] = value
      await saveMultiModelConfigChanges(newMultiModelConfigList)
    }
  }

  const handleNewKeySubmit = (defaultModel?: string) => {
    setShowKeyPopup(false)
    setShowModelPopup(true)
    setDefaultModel(defaultModel || "")
  }

  const handleKeyPopupEditSubmit = (defaultModel?: string) => {
    setShowKeyPopupEdit(false)
    setShowModelPopup(true)
    setDefaultModel(defaultModel || "")
  }

  const getModelCount = (config: MultiModelConfig, ifSupport: boolean = true) => {
    const modelVerifyText = localStorage.getItem("modelVerify")
    const allVerifiedList = modelVerifyText ? JSON.parse(modelVerifyText) : {}
    const currentVerifyList = allVerifiedList[config.apiKey || config.baseURL] ?? {}
    return config.models.filter(model => ifSupport ? getVerifyStatus(currentVerifyList[model]) !== "unSupportModel" : getVerifyStatus(currentVerifyList[model]) === "unSupportModel").length
  }

  const isNoModelAlert = (targetIndex?: number) => {
    return multiModelConfigList?.filter((config, index) => index !== (targetIndex ?? currentIndex)
      && config.active
      && getModelCount(config, true) > 0)?.length === 0
      && multiModelConfigList?.[(targetIndex ?? currentIndex)]
      && multiModelConfigList?.[(targetIndex ?? currentIndex)]?.active
      && getModelCount(multiModelConfigList?.[(targetIndex ?? currentIndex)], true) > 0
  }

  const openModelPopup = async (index: number) => {
    setCurrentIndex(index)
    setShowModelPopup(true)
  }

  const handleModelSubmit = () => {
    setDefaultModel("")
    setShowModelPopup(false)
    if (multiModelConfigList?.[currentIndex]
      && multiModelConfigList?.[currentIndex]?.active
      && multiModelConfigList?.[currentIndex]?.models.length > 0
      && getModelCount(multiModelConfigList?.[currentIndex], true) === 0) {
      setShowNoModelAlert(true)
    }
  }

  const handleConfirm = async (type: "delete" | "close") => {
    const _multiModelConfigList = JSON.parse(JSON.stringify(multiModelConfigList)) ?? []
    try {
      const targetConfig = multiModelConfigList?.[currentIndex]
      let newMultiModelConfigList = JSON.parse(JSON.stringify(multiModelConfigList)) ?? []
      let successMsg = "", errorMsg = ""

      if (type === "delete") {
        newMultiModelConfigList = multiModelConfigList?.filter((config, index) => index !== currentIndex) ?? []
        successMsg = t("models.deleteToast", { name: targetConfig?.name ?? "" })
        errorMsg = t("models.deleteFailed")
      } else {
        newMultiModelConfigList.map((multiModelConfig: MultiModelConfig, index: number) => {
          if (currentIndex > -1 && index == currentIndex) {
            newMultiModelConfigList[index].active = false
          }
        })
        successMsg = t("setup.saveSuccess")
        errorMsg = t("models.saveFailed")
      }

      const _activeProvider = newMultiModelConfigList.filter((config: MultiModelConfig) => config.active && config.models.length > 0).length === 0 ? "none" : undefined
      setMultiModelConfigList(newMultiModelConfigList)
      const data = await saveConfig(_activeProvider as InterfaceProvider)
      if (data.success) {
        showToast({
          message: successMsg,
          type: "success"
        })
        if (type === "delete") {
          const key = `${targetConfig?.accessKeyId || targetConfig?.apiKey || targetConfig?.baseURL}`
          const customModelList = localStorage.getItem("customModelList")
          const allCustomModelList = customModelList ? JSON.parse(customModelList) : {}
          delete allCustomModelList[key]
          localStorage.setItem("customModelList", JSON.stringify(allCustomModelList))
          const localListOptions = localStorage.getItem("modelVerify")
          const allVerifiedList = localListOptions ? JSON.parse(localListOptions) : {}
          delete allVerifiedList[key]
          localStorage.setItem("modelVerify", JSON.stringify(allVerifiedList))
        }
      } else {
        showToast({
          message: data.error ?? errorMsg,
          type: "error"
        })
        setMultiModelConfigList(_multiModelConfigList)
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      setMultiModelConfigList(_multiModelConfigList)
    }
    setShowDelete(false)
    setShowClose(false)
  }

  const isProviderIconNoFilter = (model: string) => {
    const isLightMode = userTheme === "system" ? systemTheme === "light" : userTheme === "light"
    switch (model) {
      case "ollama":
      case "openai_compatible":
      case "bedrock":
        return true
      case "mistralai":
        return isLightMode
      default:
        return model.startsWith("google") && isLightMode
    }
  }

  return (
    <div className="model-settings-container">
      <div className="models-container">
        <div className="models-content">
          <div className="models-content-header">
            <div className="left">
              <svg width="30px" height="30px" viewBox="0 0 46 46"><g><path d="M 18.433594 6.460938 C 12.210938 9.570312 12.851562 8.660156 12.851562 14.375 L 12.851562 19.246094 L 8.726562 21.375 L 4.566406 23.507812 L 4.566406 35.34375 L 9.300781 37.78125 C 11.90625 39.132812 14.238281 40.25 14.476562 40.25 C 14.714844 40.25 16.742188 39.304688 19.042969 38.1875 L 23.167969 36.089844 L 27.261719 38.1875 C 29.527344 39.304688 31.558594 40.25 31.761719 40.25 C 32.367188 40.25 40.757812 35.953125 41.195312 35.414062 C 41.5 35.042969 41.601562 33.351562 41.535156 29.222656 L 41.433594 23.507812 L 37.308594 21.375 L 33.148438 19.246094 L 33.148438 14.410156 C 33.148438 10.214844 33.078125 9.503906 32.570312 9.066406 C 31.660156 8.253906 23.777344 4.398438 23.101562 4.429688 C 22.761719 4.429688 20.667969 5.34375 18.433594 6.460938 Z M 26.042969 8.761719 L 28.582031 10.078125 L 25.808594 11.433594 L 23.066406 12.785156 L 20.394531 11.398438 L 17.691406 10.011719 L 20.261719 8.761719 C 21.679688 8.050781 23 7.476562 23.167969 7.476562 C 23.371094 7.476562 24.65625 8.050781 26.042969 8.761719 Z M 18.941406 13.867188 L 21.648438 15.21875 L 21.648438 18.601562 C 21.648438 20.464844 21.578125 21.984375 21.476562 21.984375 C 21.375 21.984375 20.089844 21.375 18.601562 20.632812 L 15.898438 19.28125 L 15.898438 15.898438 C 15.898438 14.035156 15.964844 12.515625 16.066406 12.515625 C 16.167969 12.515625 17.453125 13.125 18.941406 13.867188 Z M 30.101562 15.898438 L 30.101562 19.28125 L 27.398438 20.632812 C 25.910156 21.375 24.625 21.984375 24.523438 21.984375 C 24.421875 21.984375 24.351562 20.496094 24.351562 18.671875 L 24.351562 15.355469 L 27.160156 13.96875 C 28.683594 13.191406 29.96875 12.546875 30.035156 12.546875 C 30.070312 12.515625 30.101562 14.035156 30.101562 15.898438 Z M 17.082031 25.773438 L 14.410156 27.125 L 11.667969 25.808594 L 8.964844 24.453125 L 11.667969 23.066406 L 14.375 21.714844 L 17.082031 23.066406 L 19.785156 24.421875 Z M 34.332031 25.773438 L 31.660156 27.125 L 28.917969 25.808594 L 26.214844 24.453125 L 28.917969 23.066406 L 31.625 21.714844 L 34.332031 23.066406 L 37.035156 24.421875 Z M 12.851562 33.011719 L 12.851562 36.429688 L 7.101562 33.453125 L 7.101562 26.71875 L 12.851562 29.5625 Z M 21.511719 33.382812 C 21.410156 33.621094 20.089844 34.433594 18.601562 35.144531 L 15.898438 36.460938 L 15.898438 29.5625 L 18.703125 28.207031 L 21.476562 26.820312 L 21.578125 29.867188 C 21.613281 31.558594 21.613281 33.113281 21.511719 33.382812 Z M 30.101562 33.011719 L 30.101562 36.429688 L 24.351562 33.453125 L 24.351562 26.71875 L 30.101562 29.5625 Z M 38.761719 33.382812 C 38.660156 33.621094 37.339844 34.433594 35.851562 35.144531 L 33.148438 36.460938 L 33.148438 29.5625 L 35.953125 28.207031 L 38.726562 26.820312 L 38.828125 29.867188 C 38.863281 31.558594 38.863281 33.113281 38.761719 33.382812 Z M 38.761719 33.382812 " /></g></svg>
              {t("models.listTitle")}
            </div>
            <div className="right">
              {showClose && (
                <PopupConfirm
                  noBorder={true} zIndex={900} footerType="center" className="models-delete-confirm"
                  onConfirm={() => handleConfirm("close")} onCancel={() => setShowClose(false)} onClickOutside={() => setShowClose(false)}
                >
                  <div className="models-delete-confirm-content">
                    <div className="models-delete-confirm-title">{t("models.closeAllTitle")}</div>
                    <div className="models-delete-confirm-description">{t("models.closeAllDescription")}</div>
                  </div>
                </PopupConfirm>
              )}
              {showDelete && (
                <PopupConfirm
                  noBorder={true} zIndex={900} footerType="center" className="models-delete-confirm"
                  onConfirm={() => handleConfirm("delete")} onCancel={() => setShowDelete(false)} onClickOutside={() => setShowDelete(false)}
                >
                  <div className="models-delete-confirm-content">
                    <div className="models-delete-confirm-title">{isNoModelAlert() ? t("models.deleteAllTitle") : t("models.deleteTitle", { name: multiModelConfigList?.[currentIndex]?.name ?? "" })}</div>
                    <div className="models-delete-confirm-description">{isNoModelAlert() ? t("models.deleteAllDescription") : t("models.deleteDescription")}</div>
                  </div>
                </PopupConfirm>
              )}
              <button
                className="models-new-key-btn"
                onClick={() => setShowKeyPopup(true)}
              >
                {t("models.newProvider")}
              </button>
              <button
                className="models-parameter-btn"
                onClick={() => setShowParameterPopup(true)}
              >
                {t("models.parameters")}
              </button>
            </div>
          </div>
          <div className="models-list-container">
            {multiModelConfigList?.map((multiModelConfig, index) => (
              <div key={index} className="models-provider-item">
                <img
                  width={24}
                  height={24}
                  className={multiModelConfig.name && isProviderIconNoFilter(multiModelConfig.name) ? "no-filter" : ""}
                  src={PROVIDER_ICONS[multiModelConfig.name] || "img://logo.svg"}
                  alt={multiModelConfig.name}
                />
                <div className="models-provider-name">{PROVIDER_LABELS[multiModelConfig.name] || multiModelConfig.name}</div>
                <div className="models-provider-models">
                  {getModelCount(multiModelConfig, true)}
                </div>
                <div>
                  <div className="models-popup-btn-container">
                    <div
                      className="models-popup-btn"
                      onClick={() => openModelPopup(index)}
                    >
                      {getModelCount(multiModelConfig, true)}
                    </div>
                    {getModelCount(multiModelConfig, false) > 0 &&
                      <Tooltip content={t("models.unSupportModelCount", { count: getModelCount(multiModelConfig, false) })}>
                        <svg className="models-unsupport-count-tooltip" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"></circle>
                          <line x1="12" y1="6" x2="12" y2="14" stroke="currentColor" strokeWidth="2"></line>
                          <circle cx="12" cy="17" r="1.5" fill="currentColor"></circle>
                        </svg>
                      </Tooltip>}
                  </div>
                </div>
                <div>
                  <div className="provider-edit-menu">
                    <Dropdown
                      options={[
                        {
                          label: t("models.providerMenu2"),
                          onClick: () => {
                            setCurrentIndex(index);
                            setShowKeyPopupEdit(true);
                          }
                        },
                        {
                          label: t("models.providerMenu1"),
                          onClick: () => {
                            setCurrentIndex(index);
                            setShowDelete(true);
                          }
                        },
                      ]}
                    >
                      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0 0h24v24H0z" fill="none" /><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </Dropdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showKeyPopup && <KeyPopup onClose={() => setShowKeyPopup(false)} onSuccess={handleNewKeySubmit} />}
        {showKeyPopupEdit && <KeyPopupEdit onClose={() => setShowKeyPopupEdit(false)} onSuccess={handleKeyPopupEditSubmit} />}
        {showParameterPopup && <ParameterPopup onClose={() => setShowParameterPopup(false)} />}
        {showModelPopup && <ModelPopup defaultModel={defaultModel} onClose={() => { setShowModelPopup(false); setDefaultModel(""); }} onSuccess={handleModelSubmit} />}
        {showNoModelAlert && (
          <PopupConfirm
            noBorder={true} zIndex={900} footerType="center" className="models-delete-confirm"
            onConfirm={() => { setShowNoModelAlert(false) }}
            onClickOutside={() => { setShowNoModelAlert(false) }}
          >
            <div className="models-delete-confirm-content">
              <div className="models-delete-confirm-title">{t("models.noModelAlertTitle")}</div>
              <div className="models-delete-confirm-description">{t("models.noModelAlertDescription")}</div>
            </div>
          </PopupConfirm>
        )}
      </div>
    </div>
  )
}

const ModelSettingsPage = () => {
  return (
    <ModelsProvider>
      <ModelSettingsPageContent />
    </ModelsProvider>
  )
}

export default ModelSettingsPage