import React from "react";
import "./SidePanel.css"; // Import the CSS file
import Canvas from "../../components/Canvas/Canvas";

interface SidePanelProps {
  isOpen: boolean;
  chatId: string;
  onClose: () => void;
  // Add any other state or props needed for the panel content later
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, chatId }) => {
  return (
    <div className={`side-panel ${isOpen ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>×</button>
      {/* Content of the side panel will go here */}
      sample buttons
      <button onClick={() => {
        window.electron.ipcRenderer.send('open-canvas', chatId);
      }}>Open Canvas</button>

      <button onClick={() => {
        window.electron.ipcRenderer.send('open-canvas', chatId);
      }}>Open Canvas</button>

      <Canvas chatId={chatId} />
    </div>
  );
};

export default SidePanel;