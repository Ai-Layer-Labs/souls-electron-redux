import React, { useState, useCallback, useRef } from 'react';
import ThreeDModelComponent from './ThreeDModelComponent';
import { CanvasContentData } from 'stores/useCanvasStore';

// Sample model URLs - these are common test models in the 3D community
const SAMPLE_MODELS = [
  {
    name: 'Bearbrick',
    url: '/assets/models/bearbrick.glb',
    description: 'Local bearbrick model'
  },
  {
    name: 'Duck',
    url: 'https://threejs.org/examples/models/gltf/Duck.gltf',
    description: 'Classic GLTF test model'
  },
  {
    name: 'Damaged Helmet',
    url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    description: 'PBR materials showcase'
  },
  {
    name: 'Flamingo',
    url: 'https://threejs.org/examples/models/gltf/Flamingo.glb',
    description: 'Animated model'
  },
  {
    name: 'Horse',
    url: 'https://threejs.org/examples/models/gltf/Horse.glb',
    description: 'Simple animated model'
  }
];

// Controls explanation
const CONTROLS_INFO = [
  { key: 'rotate', label: 'Rotate', action: 'Click and drag' },
  { key: 'zoom', label: 'Zoom', action: 'Scroll wheel' },
  { key: 'pan', label: 'Pan', action: 'Right-click and drag or Shift + drag' },
  { key: 'reset', label: 'Reset View', action: 'Double-click' }
];

const ThreeDModelComponentSamples: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(SAMPLE_MODELS[0]);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [customModel, setCustomModel] = useState<{ url: string, name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create data object for the ThreeDModelComponent
  const modelData: CanvasContentData = {
    modelUrl: customModel ? customModel.url : selectedModel.url
  };

  // Handle file selection via button
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };
  
  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropActive(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);
  
  // Process the dropped/selected files
  const handleFiles = (files: FileList) => {
    let modelFile: File | null = null;
    
    // Look for a .glb or .gltf file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        modelFile = file;
        break;
      }
    }
    
    if (modelFile) {
      const objectUrl = URL.createObjectURL(modelFile);
      setCustomModel({
        url: objectUrl,
        name: modelFile.name
      });
    } else {
      alert('No .glb or .gltf file found in the selection. Please try again with a valid 3D model file.');
    }
  };
  
  // Reset to sample models
  const resetToSamples = () => {
    if (customModel && customModel.url) {
      URL.revokeObjectURL(customModel.url);
    }
    setCustomModel(null);
  };
  
  return (
    <div 
      className="flex flex-col h-full"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 bg-gray-800">
        <h2 className="text-xl font-semibold text-white mb-2">3D Model Viewer</h2>
        
        {customModel ? (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">
                Viewing custom model: <span className="font-medium">{customModel.name}</span>
              </span>
              <button
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded"
                onClick={resetToSamples}
              >
                Back to samples
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {SAMPLE_MODELS.map((model) => (
                <button
                  key={model.name}
                  className={`px-3 py-2 rounded text-sm ${
                    selectedModel.name === model.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  {model.name}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {selectedModel.description}
            </div>
          </>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center">
            <button 
              className="mr-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center"
              onClick={handleFileSelect}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Load model
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".glb,.gltf" 
              onChange={handleFileInputChange}
            />
            <span className="text-blue-400 mr-2">or drop files here</span>
          </div>
          
          <button 
            className="text-blue-400 hover:text-blue-300"
            onClick={() => setShowControlsInfo(!showControlsInfo)}
          >
            {showControlsInfo ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
        
        {/* Controls explanation */}
        {showControlsInfo && (
          <div className="mt-3 p-2 bg-gray-700 rounded text-xs grid grid-cols-2 gap-2">
            {CONTROLS_INFO.map(control => (
              <div key={control.key} className="flex items-start">
                <div className="text-blue-300 font-medium mr-2">{control.label}:</div>
                <div className="text-gray-300">{control.action}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Drop overlay */}
      {isDropActive && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-blue-600/80 p-8 rounded-lg text-white text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium">Drop your glTF/GLB model here</p>
          </div>
        </div>
      )}
      
      <div className="flex-grow">
        <ThreeDModelComponent data={modelData} />
      </div>
    </div>
  );
};

export default ThreeDModelComponentSamples; 