import React, { useState } from 'react';
import { Button, Tooltip, Badge, Text } from '@fluentui/react-components';
import { Delete24Regular, Info24Regular, Cube24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import useCanvasStore, { CanvasContentType, CanvasContentData } from 'stores/useCanvasStore';
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
          <Button
            appearance="subtle"
            size="small"
            onClick={() => setShow3DTest(false)}
          >
            {t('Debug.Back', 'Back to Debug Tools')}
          </Button>
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
          <Tooltip content={t('Debug.3DTest', '3D Model Test')} relationship="label">
            <Button
              icon={<Cube24Regular />}
              appearance="subtle"
              size="small"
              onClick={handleOpen3DTest}
            />
          </Tooltip>
          <Tooltip content={t('Debug.ShowInfo', 'Toggle Info')} relationship="label">
            <Button
              icon={<Info24Regular />}
              appearance="subtle"
              size="small"
              onClick={() => setShowInfo(!showInfo)}
            />
          </Tooltip>
          <Button
            icon={<Delete24Regular />}
            appearance="subtle"
            size="small"
            onClick={clearContent}
            title={t('Debug.Clear', 'Clear Content')}
          >
            {t('Debug.Clear', 'Clear')}
          </Button>
        </div>
      </div>

      {/* Content type info */}
      {showInfo && (
        <div className="canvas-debug-info mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex gap-2 items-center mb-1">
            <Text weight="semibold">Current Type:</Text>
            <Badge appearance="filled" color="brand">{contentType}</Badge>
          </div>
          <div className="overflow-hidden">
            <Text weight="semibold">Data Keys:</Text>
            <div className="text-gray-600">
              {Object.keys(contentData).map(key => (
                <Badge key={key} className="mr-1" appearance="outline" color="informative">{key}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="canvas-debug-buttons flex flex-wrap gap-2">
        {visibleContentTypes.map(type => (
          <Tooltip key={type} content={type} relationship="label">
            <Button
              size="small"
              appearance={contentType === type ? "primary" : "subtle"}
              onClick={() => handleContentTypeSelect(type)}
            >
              {type === '3d-model' ? '3D' : type === 'web-content' ? 'Web' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default CanvasDebugTools;