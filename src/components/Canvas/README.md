# Multi-Canvas Component

This implementation adds a versatile content display component to the Souls application, replacing the Inspector with a more functional multi-purpose canvas.

## Features

- Displays different content types in a unified canvas
- Automatically extracts and displays content from LLM responses
- Supports toggling visibility and resizing
- Currently supports:
  - Text content
  - Code with syntax highlighting
  - Images
  - Videos (including YouTube embeds)
  - Maps with OpenStreetMap integration
  - Charts (placeholder with data display)
  - PDF documents
  - Terminal emulation (placeholder)
  - 3D models (placeholder)
  - Web content in iframes
  - Infinite canvas for drawing (placeholder)

## Architecture

### Core Components
- `useCanvasStore.ts`: Zustand store for managing canvas state and content
- `Canvas.tsx`: Main container component with resize handle
- `ContentRouter.tsx`: Routes to the appropriate content component based on content type

### Content Components
- `TextComponent.tsx`: Displays plain text
- `ImageComponent.tsx`: Displays images
- `CodeComponent.tsx`: Displays code with syntax highlighting
- `VideoComponent.tsx`: Displays videos and YouTube embeds
- `MapComponent.tsx`: Displays maps with location markers
- `ChartComponent.tsx`: Displays chart data
- `PDFComponent.tsx`: Displays PDF documents
- `TerminalComponent.tsx`: Simulates terminal output
- `ThreeDModelComponent.tsx`: Displays 3D models (placeholder)
- `WebComponent.tsx`: Displays web content in iframes
- `InfiniteCanvasComponent.tsx`: Drawing canvas placeholder

### Utility
- `canvasContentExtractor.ts`: Extracts content from message responses

## Content Extraction

The system automatically analyzes AI responses and extracts content such as:
- Code blocks (```language code```)
- Images (![alt](url))
- URLs (including videos, PDFs, etc.)
- JSON definitions for explicit content type definitions

### JSON Content Format

For explicit content definition, use this format in your response:

```json
{
  "contentType": "code",
  "data": {
    "language": "javascript",
    "code": "console.log('Hello, world!');"
  }
}
```

## Usage

To use the canvas in a component:

```tsx
import { useCanvasStore } from 'stores/useCanvasStore';

function MyComponent() {
  const { setContent, setVisibility } = useCanvasStore();
  
  // Show code in the canvas
  const showCode = () => {
    setContent('chat123', 'code', {
      language: 'javascript',
      code: 'console.log("Hello world");'
    });
    setVisibility(true);
  };
  
  return (
    <button onClick={showCode}>Show Code</button>
  );
}
```

## Development Roadmap

### Planned Enhancements
1. Implement full chart rendering with Chart.js
2. Implement proper terminal emulation with xterm.js
3. Implement 3D model viewer with Three.js
4. Implement infinite canvas with drawing capabilities
5. Add multiple canvas tabs for comparing outputs
6. Add user interaction capabilities (editing, annotating)
7. Add fullscreen mode for better viewing experience
8. Add content export functionality

### Adding a New Content Type
1. Define the content type in `useCanvasStore.ts`
2. Create a new component for rendering the content
3. Add the component to the `ContentRouter.tsx` switch statement
4. Update the content extraction logic in `canvasContentExtractor.ts`
5. Add any specific styles to `Canvas.scss`

## Debugging

In development mode, the canvas includes a debug toolbar that allows testing different content types. This helps with development and testing of new canvas features. 