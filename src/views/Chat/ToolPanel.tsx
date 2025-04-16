import React, { useMemo } from "react"
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow, darcula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useAtomValue } from "jotai"
import { themeAtom } from "../../atoms/themeState"
import { safeBase64Decode } from "../../util"
import { useTranslation } from "react-i18next"

interface ToolPanelProps {
  content: string
  name: string
}

const callStr = "##Tool Calls:"
const resultStr = "##Tool Result:"

function getToolResult(content: string) {
  let calls = ""
  let results: string[] = []

  try {
    const resultIndex = content.indexOf(resultStr)
    calls = resultIndex === -1 ? content.slice(callStr.length) : content.slice(callStr.length, resultIndex)

    if (resultIndex !== -1) {
      results = content
        .slice(resultIndex + resultStr.length)
        .split(resultStr)
        .filter(result => result.trim() !== "")
    }
  } catch (e) {
    console.error("Error parsing tool results:", e)
  }

  return {
    calls,
    results
  }
}

function formatJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString.trim())
    return JSON.stringify(parsed, null, 2)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return jsonString
  }
}

const Code = ({ content }: { content: string }) => {
  const [theme] = useAtomValue(themeAtom)

  return (
    <SyntaxHighlighter
      language={"json"}
      style={theme === "dark" ? tomorrow : darcula}
      showLineNumbers={true}
      customStyle={{
        margin: 0,
        height: "100%",
        background: "transparent",
        backgroundColor: "var(--bg-modal)"
      }}
      codeTagProps={{
        style: {
          fontSize: "14px",
          lineHeight: "1.5"
        }
      }}
    >
      {content}
    </SyntaxHighlighter>
  )
}

// Define an interface for the items within the result content array
interface ToolResultContentItem {
  type: "image" | "text"
  data?: string // Base64 data for image
  mimeType?: string // Mime type for image
  text?: string // Text content
}

// Component to render individual result items (text or image)
const ResultItem = ({ item }: { item: ToolResultContentItem }) => {
  if (item.type === "image" && item.data && item.mimeType) {
    // Check if data is already a data URL or needs prefix
    const src = item.data.startsWith("data:") ? item.data : `data:${item.mimeType};base64,${item.data}`
    return <img src={src} alt="Tool generated image" style={{ maxWidth: "100%", maxHeight: "400px", marginTop: "10px" }} />
  } else if (item.type === "text" && item.text) {
    // Try formatting the text as JSON, otherwise display raw
    let contentToDisplay = item.text
    try {
      const parsedText = JSON.parse(item.text.trim())
      contentToDisplay = JSON.stringify(parsedText, null, 2)
      // If it's JSON, display in a code block for better readability
      return <Code content={contentToDisplay} />
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // Not JSON, display as plain text
      return <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", margin: "10px 0" }}>{contentToDisplay}</pre>
    }
  }
  return null // Or some fallback UI for unknown types
}

// New logic to render results, checking for image/text structure
const renderResult = (resultString: string, index: number, totalResults: number) => {
  try {
    const decodedResult = safeBase64Decode(resultString)
    const parsedResult = JSON.parse(decodedResult.trim())

    // Check if the parsed result itself is a single ToolResultContentItem
    if (parsedResult && (parsedResult.type === "image" || parsedResult.type === "text")) {
      return (
        <div key={index} className="result-block">
          <span>Results{totalResults > 1 ? ` ${index + 1}` : ""}:</span>
          <ResultItem item={parsedResult as ToolResultContentItem} />
        </div>
      )
    // Check if it has the expected structure with a content array
    } else if (parsedResult && Array.isArray(parsedResult.content)) {
      return (
        <div key={index} className="result-block">
          <span>Results{totalResults > 1 ? ` ${index + 1}` : ""}:</span>
          {parsedResult.content.map((item: ToolResultContentItem, itemIndex: number) => (
            <ResultItem key={itemIndex} item={item} />
          ))}
        </div>
      )
    } else {
      // Fallback: Not the expected structure, format as JSON code
      const formatted = formatJSON(decodedResult)
      return (
        <div key={index} className="result-block">
         <span>Results{totalResults > 1 ? ` ${index + 1}` : ""}:</span>
         <Code content={formatted} />
        </div>
      )
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    // Fallback: Not JSON or other error, format the original (decoded) string as JSON code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // console.error("Error parsing or rendering tool result:", _e)
    const formatted = formatJSON(safeBase64Decode(resultString)) // Format the decoded string
     return (
        <div key={index} className="result-block">
         <span>Results{totalResults > 1 ? ` ${index + 1}` : ""}:</span>
         <Code content={formatted} />
        </div>
      )
  }
}

const ToolPanel: React.FC<ToolPanelProps> = ({ content, name }) => {
  const { t } = useTranslation()
  const { calls, results } = useMemo(() => getToolResult(content), [content])
  const formattedCalls = useMemo(() => formatJSON(safeBase64Decode(calls)), [calls])

  if (!content || !content.startsWith(callStr)) {
    return <></>
  }

  return (
    <details className="tool-panel">
      <summary>
        {t("chat.toolCalls", { name })}
      </summary>
      <div className="tool-content">
        <span>Calls:</span>
        <Code content={formattedCalls} />

        {results.length > 0 && (
           results.map((result, index) => renderResult(result, index, results.length))
        )}
      </div>
    </details>
  )
}

export default React.memo(ToolPanel)