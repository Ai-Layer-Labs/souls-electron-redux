import React from "react";
import "./SidePanel.css"; // Import the CSS file

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Add any other state or props needed for the panel content later
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`side-panel ${isOpen ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>×</button>
      {/* Content of the side panel will go here */}
      <h2>Side Panel Content</h2>
      <p>This is where the additional state and functionality will live.</p>
    </div>
  );
};

export default SidePanel;