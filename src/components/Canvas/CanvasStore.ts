import { create } from 'zustand';

// Supported content types
export type CanvasContentType =
  | "text"
  | "image"
  | "video"
  | "code"
  | "map"
  | "chart"
  | "pdf"
  | "3d-model"
  | "terminal"
  | "web-content"
  | "canvas"
  | "calendar"
  | "unsupported";

// Data structure for different content types
export interface CanvasContentData {
  src?: string; // For images, videos, PDFs, etc.
  code?: string; // For code snippets
  language?: string; // For code snippets (e.g., "javascript")
  position?: [number, number]; // For map (latitude, longitude)
  zoom?: number; // For map
  chartType?: "bar" | "line" | "pie"; // For chart
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  }; // For chart
  modelUrl?: string; // For 3D models (GLTF format)
  url?: string; // For web content
  contentType?: 'web' | '3d'; // For web content type
  terminalOptions?: {
    initialText?: string;
    customCommands?: Record<string, (args: string[]) => string>;
    prompt?: string;
  }; // For terminal emulator
  text?: string; // For plain text content
  events?: Array<{
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    calendar?: string;
    id?: string;
  }>; // For calendar events
  droppedText?: string; // For text dropped onto the canvas
  timestamp?: number; // Timestamp for when the content was created/dropped
  [key: string]: unknown; // Flexible for future content types
}

// State interface for the canvas store
interface CanvasState {
  contentType: CanvasContentType;
  contentData: CanvasContentData;
  chatId: string | null;
  isVisible: boolean;
  width: number;
  setContent: (chatId: string, type: CanvasContentType, data: CanvasContentData) => void;
  clearContent: () => void;
  setVisibility: (visible: boolean) => void;
  setWidth: (width: number) => void;
  setDroppedText: (text: string) => void; // Add method to set dropped text
}

// Default content data
const defaultContentData: CanvasContentData = {
  text: "No content to display"
};

// Create the store
const useCanvasStore = create<CanvasState>((set) => ({
  contentType: "text",
  contentData: defaultContentData,
  chatId: null,
  isVisible: true,
  width: 600, // Default width

  setContent: (chatId, type, data) => set({
    chatId,
    contentType: type,
    contentData: data
  }),

  clearContent: () => set({
    contentType: "text",
    contentData: defaultContentData,
    chatId: null
  }),

  setVisibility: (visible) => set({
    isVisible: visible
  }),

  setWidth: (width) => set({
    width: width
  }),
  
  setDroppedText: (text) => set((state) => ({
    contentData: {
      ...state.contentData,
      droppedText: text,
      timestamp: Date.now()
    }
  }))
}));

export default useCanvasStore;