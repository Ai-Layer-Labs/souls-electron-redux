import React, { useState } from 'react';
// Remove Fluent UI imports
// import { Button, Tooltip, Badge, Text } from '@fluentui/react-components';
// import { Delete24Regular, Info24Regular, Cube24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import useCanvasStore, { CanvasContentType, CanvasContentData } from './CanvasStore';
import ThreeDModelComponentSamples from './ThreeDModelComponentSamples';

interface CanvasDebugToolsProps {
  chatId: string;
}

// Sample data for each content type
const contentSamples: Record<CanvasContentType, CanvasContentData> = {
  'text': {
    text: 'This is a sample text content for the canvas. It demonstrates how text is displayed in the multi-canvas component.'
  },
  'code': {
    language: 'javascript',
    code: `// Sample JavaScript code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`The 10th Fibonacci number is \${result}\`);`
  },
  'image': {
    src: 'https://picsum.photos/800/600'
  },
  'video': {
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  'map': {
    position: [40.7128, -74.006], // New York
    zoom: 12
  },
  'chart': {
    chartType: 'bar',
    chartData: {
      labels: ['January', 'February', 'March', 'April'],
      datasets: [{
        label: 'Sample Data',
        data: [65, 59, 80, 81],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: '#000',
        borderWidth: 1
      }]
    }
  },
  'pdf': {
    src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  '3d-model': {
    modelUrl: '/assets/models/bearbrick.glb'
  },
  'terminal': {
    terminalOptions: {
      initialText: 'Welcome to the debug terminal!\nType "help" to see available commands.',
      prompt: 'debug$ '
    }
  },
  'web-content': {
    url: 'https://sou.ls',
    contentType: 'web'
  },
  'canvas': {
    url: 'https://example.com/canvas'
  },
  'calendar': {
    url: 'https://example.com/calendar'
  },
  'unsupported': {
    text: 'This content type is not supported yet.'
  }
};

// Define content types to show in the toolbar
const visibleContentTypes: CanvasContentType[] = [
  'text', 'code', 'image', 'video', 'map', 'chart', 'pdf', '3d-model', 'terminal', 'web-content', 'canvas', 'calendar'
];

const CanvasDebugTools: React.FC<CanvasDebugToolsProps> = ({ chatId }) => {
  const { t } = useTranslation();
  const { setContent, contentType, contentData, clearContent } = useCanvasStore();
  const [showInfo, setShowInfo] = useState(false);
  const [show3DTest, setShow3DTest] = useState(false);

  const handleContentTypeSelect = (type: CanvasContentType) => {
    console.log("handleContentTypeSelect", type)
    console.log("handleContentTypeSelect", contentSamples[type])
    setContent(chatId, type, contentSamples[type]);
  };

  // Function to open the 3D model test view
  const handleOpen3DTest = () => {
    setShow3DTest(true);
  };

  if (show3DTest) {
    return (
      <div className="canvas-debug-tools h-full flex flex-col">
        <div className="flex justify-between items-center mb-2 p-2">
          <div className="canvas-debug-title text-sm font-medium">
            {t('Debug.3DModelTest', '3D Model Viewer Test')}
          </div>
          {/* Replace Button with button */}
          <button
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            onClick={() => setShow3DTest(false)}
          >
            {t('Debug.Back', 'Back to Debug Tools')}
          </button>
        </div>

        <div className="flex-grow">
          <ThreeDModelComponentSamples />
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-debug-tools">
      <div className="flex justify-between items-center mb-2">
        <div className="canvas-debug-title text-sm text-gray-600">
          {t('Debug.TestContent', 'Test Content Types:')}
        </div>
        <div className="flex gap-2">
          {/* Replace Tooltip and Button with button and title */}
          <button
            className="p-1 border rounded hover:bg-gray-100"
            onClick={handleOpen3DTest}
            title={t('Debug.3DTest', '3D Model Test')}
          >
            {/* Basic Cube SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </button>
          {/* Replace Tooltip and Button with button and title */}
          <button
            className="p-1 border rounded hover:bg-gray-100"
            onClick={() => setShowInfo(!showInfo)}
            title={t('Debug.ShowInfo', 'Toggle Info')}
          >
            {/* Basic Info SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
          {/* Replace Button with button */}
          <button
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100 flex items-center gap-1"
            onClick={clearContent}
            title={t('Debug.Clear', 'Clear Content')}
          >
            {/* Basic Delete SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            {t('Debug.Clear', 'Clear')}
          </button>
        </div>
      </div>

      {/* Content type info */}
      {showInfo && (
        <div className="canvas-debug-info mb-3 p-2 bg-gray-100 rounded text-xs border">
          <div className="flex gap-2 items-center mb-1">
            {/* Replace Text with span */}
            <span className="font-semibold">Current Type:</span>
            {/* Replace Badge with span */}
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">{contentType}</span>
          </div>
          <div className="overflow-hidden">
            {/* Replace Text with span */}
            <span className="font-semibold">Data Keys:</span>
            <div className="text-gray-600 mt-1">
              {Object.keys(contentData).map(key => (
                /* Replace Badge with span */
                <span key={key} className="inline-block px-2 py-0.5 text-xs font-medium rounded border border-gray-300 bg-gray-50 mr-1 mb-1">{key}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="canvas-debug-buttons flex flex-wrap gap-2">
        {visibleContentTypes.map(type => (
          // Replace Tooltip and Button with button and title
          <button
            key={type}
            title={type}
            className={`px-2 py-1 text-sm border rounded ${contentType === type ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => handleContentTypeSelect(type)}
          >
            {type === '3d-model' ? '3D' : type === 'web-content' ? 'Web' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CanvasDebugTools;