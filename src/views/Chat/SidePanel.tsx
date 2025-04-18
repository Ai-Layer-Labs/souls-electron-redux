import React from "react";
import "@tldraw/tldraw/tldraw.css";
import InfiniteCanvasComponent from "../../components/Canvas/InfiniteCanvasComponent";
import useCanvasStore from "../../components/Canvas/CanvasStore";
interface SidePanelProps {
  isOpen: boolean;
  chatId: string;
  onClose: () => void;
  // Add any other state or props needed for the panel content later
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, chatId }) => {
  // Determine if this is a new chat or an existing chat
  const isNewChat = !chatId;

  return (
    <div
      className={`
        ${isOpen ? 'w-1/2 translate-x-0 p-5 pointer-events-auto' : 'w-0 translate-x-full p-0 pointer-events-none'}
        flex-shrink-0 h-full bg-default-50
        shadow-[-2px_0_5px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_rgba(255,255,255,0.1)]
        transition-all duration-300 ease-in-out rounded-tl-[15px] overflow-hidden
        flex flex-col relative z-20
      `}
    >
      <button
        className="absolute top-[10px] right-[10px] bg-transparent border-none text-2xl cursor-pointer"
        onClick={onClose}
      >
        ×
      </button>
      <NewCanvas chatId={chatId} />
    </div>
  );
};

const NewCanvas: React.FC<{ chatId: string }> = ({ chatId }) => {
  const contentData = useCanvasStore((state) => state.contentData);

  // Log when canvas is mounted for a specific chat
  React.useEffect(() => {
    console.log(`Canvas mounted for chat ID: ${chatId || 'new chat'}`);
  }, [chatId]);

  return (
    <div className="flex mt-8 flex-col h-full">
      <InfiniteCanvasComponent data={contentData} />
    </div>
  );
};

export default SidePanel;