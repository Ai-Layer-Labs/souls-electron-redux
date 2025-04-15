import React from 'react';
import { CanvasContentType, CanvasContentData } from './CanvasStore';
import TextComponent from './TextComponent';
import ImageComponent from './ImageComponent';
import CodeComponent from './CodeComponent';
import VideoComponent from './VideoComponent';
import MapComponent from './MapComponent';
import ChartComponent from './ChartComponent';
import PDFComponent from './PDFComponent';
import TerminalComponent from './TerminalComponent';
import ThreeDModelComponent from './ThreeDModelComponent';
import WebComponent from './WebComponent';
import InfiniteCanvasComponent from './InfiniteCanvasComponent';

interface ContentRouterProps {
  contentType: CanvasContentType;
  data: CanvasContentData;
}

const ContentRouter: React.FC<ContentRouterProps> = ({ contentType, data }) => {
  switch (contentType) {
    case 'text':
      return <TextComponent data={data} />;
    case 'image':
      return <ImageComponent data={data} />;
    case 'code':
      return <CodeComponent data={data} />;
    case 'video':
      return <VideoComponent data={data} />;
    case 'map':
      return <MapComponent data={data} />;
    case 'chart':
      return <ChartComponent data={data} />;
    case 'pdf':
      return <PDFComponent data={data} />;
    case '3d-model':
      return <ThreeDModelComponent data={data} />;
    case 'terminal':
      return <TerminalComponent data={data} />;
    case 'web-content':
      return <WebComponent data={data} />;
    case 'canvas':
      return <InfiniteCanvasComponent data={data} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">
            {`Content type '${contentType}' is not currently supported`}
          </div>
        </div>
      );
  }
};

export default ContentRouter;