// Import essentials first
import React, { Suspense, lazy } from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import { RealThreeDModelComponent } from './RealThreeDModelComponent';

// Define the interface for the component props
interface ThreeDModelProps {
  data: CanvasContentData;
}

// Fallback component for when Three.js is loading
const FallbackThreeDModelComponent: React.FC<ThreeDModelProps> = ({ data }) => {
  const modelUrl = data.modelUrl || '/assets/models/bearbrick.glb';

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full h-full rounded-lg overflow-hidden relative bg-gray-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="mt-4 text-white">
            Loading 3D components...
          </div>
        </div>
        
        {/* Interface overlay */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-3 text-white pointer-events-none">
          <div className="text-sm font-medium truncate">
            {modelUrl.split('/').pop()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that uses error boundaries and suspense
const ThreeDModelComponent: React.FC<ThreeDModelProps> = ({ data }) => {
  return (
    <ErrorBoundary fallback={<FallbackThreeDModelComponent data={data} />}>
      <Suspense fallback={<FallbackThreeDModelComponent data={data} />}>
        <RealThreeDModelComponent data={data} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Simple error boundary component to catch Three.js errors
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error in Three.js component:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default ThreeDModelComponent; 