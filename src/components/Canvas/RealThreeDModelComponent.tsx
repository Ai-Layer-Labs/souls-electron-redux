import * as THREE from 'three';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Grid, 
  PerspectiveCamera,
  Stats,
  useAnimations
} from '@react-three/drei';
import { CanvasContentData } from 'stores/useCanvasStore';

// JSX declarations for React Three Fiber components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      primitive: any;
      boxGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

// Define the interface for the component props
export interface ThreeDModelProps {
  data: CanvasContentData;
}

// Define available environment presets
type EnvironmentPreset = 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby' | 'city';

// Define model info interface for metadata display
interface ModelInfo {
  triangleCount: number;
  vertexCount: number;
  materialCount: number;
  textureCount: number;
  animationCount: number;
  generator?: string;
}

// Model component with centering and animation
function Model({ url, onLoadComplete }: { url: string; onLoadComplete?: (info: ModelInfo) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { camera } = useThree();
  const { actions, mixer } = useAnimations(animations, groupRef);
  const [hasCentered, setHasCentered] = useState(false);

  // Play the first animation if available
  useEffect(() => {
    if (animations?.length > 0 && actions) {
      const actionNames = Object.keys(actions);
      if (actionNames.length > 0) {
        const firstAction = actions[actionNames[0]];
        if (firstAction) {
          firstAction.reset().fadeIn(0.5).play();
        }
      }
    }
  }, [actions, animations]);

  // Center and scale the model to fit the view
  useEffect(() => {
    if (!scene || !groupRef.current || hasCentered) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Reset transformations
    scene.position.set(-center.x, -center.y, -center.z);
    
    // Scale to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetSize = 2;
      const scale = targetSize / maxDim;
      scene.scale.multiplyScalar(scale);
    }

    // Position camera to view the whole model
    const distance = Math.max(size.x, size.y) * 2.5;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    setHasCentered(true);
    
    // Gather model info
    if (onLoadComplete) {
      let triangleCount = 0;
      let vertexCount = 0;
      let materialSet = new Set();
      let textureSet = new Set();
      
      // Traverse the scene to count geometry stats
      scene.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          const mesh = node;
          const geometry = mesh.geometry;
          
          // Count vertices
          if (geometry.getAttribute('position')) {
            vertexCount += geometry.getAttribute('position').count;
          }
          
          // Count faces/triangles
          if (geometry.index) {
            triangleCount += geometry.index.count / 3;
          } else if (geometry.getAttribute('position')) {
            triangleCount += geometry.getAttribute('position').count / 3;
          }
          
          // Track materials
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => materialSet.add(mat));
          } else if (mesh.material) {
            materialSet.add(mesh.material);
          }
          
          // Track textures
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach(material => {
              Object.entries(material).forEach(([key, value]) => {
                if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
                  textureSet.add(value);
                }
              });
            });
          }
        }
      });
      
      // Get generator info if available from userData or from the parser
      const generator = scene.userData?.generator;
      
      onLoadComplete({
        triangleCount: Math.round(triangleCount),
        vertexCount: vertexCount,
        materialCount: materialSet.size,
        textureCount: textureSet.size,
        animationCount: animations?.length || 0,
        generator: generator
      });
    }
  }, [scene, camera, hasCentered, animations, onLoadComplete]);

  // Update animations
  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  return <group ref={groupRef}><primitive object={scene} /></group>;
}

// Loading spinner
function LoadingSpinner() {
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#2196f3" wireframe />
    </mesh>
  );
}

// Main wrapper component that sets up the Canvas environment
export const RealThreeDModelComponent: React.FC<ThreeDModelProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [environment, setEnvironment] = useState<EnvironmentPreset>('city');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  
  // Available environment presets
  const environmentPresets: EnvironmentPreset[] = [
    'city', 'sunset', 'dawn', 'night', 'warehouse', 
    'forest', 'apartment', 'studio', 'park', 'lobby'
  ];
  
  // Default to Duck model if none provided
  const modelUrl = useMemo(() => {
    return data.modelUrl || '/assets/models/bearbrick.glb';
  }, [data.modelUrl]);

  // Interface controls
  const toggleGrid = () => setShowGrid(!showGrid);
  const toggleStats = () => setShowStats(!showStats);
  const toggleRotate = () => setAutoRotate(!autoRotate);
  const toggleModelInfo = () => setShowModelInfo(!showModelInfo);
  const cycleEnvironment = () => {
    const currentIndex = environmentPresets.indexOf(environment);
    const nextIndex = (currentIndex + 1) % environmentPresets.length;
    setEnvironment(environmentPresets[nextIndex]);
  };

  // Handle model load completion
  const handleModelLoaded = (info: ModelInfo) => {
    setModelInfo(info);
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        {showStats && <Stats />}
        
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        <color attach="background" args={['#151520']} />
        
        <hemisphereLight intensity={0.5} />
        <spotLight 
          position={[5, 10, 7.5]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        
        {showGrid && <Grid 
          infiniteGrid 
          cellSize={0.5}
          cellThickness={0.5}
          sectionSize={3}
          sectionThickness={1}
          fadeDistance={30}
        />}
        
        <React.Suspense fallback={<LoadingSpinner />}>
          <Model url={modelUrl} onLoadComplete={handleModelLoaded} />
          <Environment preset={environment} />
        </React.Suspense>
        
        <OrbitControls 
          makeDefault 
          autoRotate={autoRotate} 
          autoRotateSpeed={1}
          minDistance={2}
          maxDistance={20}
          enableDamping
        />
      </Canvas>

      {/* Interface overlay - controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button 
          onClick={toggleGrid} 
          className="p-2 rounded-full bg-blue-600/50 text-white hover:bg-blue-700/80 transition-colors"
          title="Toggle Grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>
        <button 
          onClick={toggleRotate} 
          className="p-2 rounded-full bg-blue-600/50 text-white hover:bg-blue-700/80 transition-colors"
          title="Toggle Auto-Rotate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M2.985 19.644a8.204 8.204 0 01-1.412-7.822 8.25 8.25 0 0113.802-3.7l3.182 3.182m-6.365-6.366l-3.183 3.183a8.25 8.25 0 00-13.803 3.7m0 0A8.212 8.212 0 01.261 7.828a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button 
          onClick={cycleEnvironment} 
          className="p-2 rounded-full bg-blue-600/50 text-white hover:bg-blue-700/80 transition-colors"
          title="Change Environment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
        </button>
        <button 
          onClick={toggleStats} 
          className="p-2 rounded-full bg-blue-600/50 text-white hover:bg-blue-700/80 transition-colors"
          title="Toggle Stats"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </button>
        <button 
          onClick={toggleModelInfo} 
          className="p-2 rounded-full bg-blue-600/50 text-white hover:bg-blue-700/80 transition-colors"
          title="Model Info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
      </div>
      
      {/* Interface overlay - model info */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-3 text-white pointer-events-none flex justify-between items-center">
        <div className="text-sm font-medium truncate">
          {modelUrl.split('/').pop()}
        </div>
        <div className="text-xs opacity-70">
          Environment: {environment}
        </div>
      </div>
      
      {/* Model Info Panel */}
      {showModelInfo && modelInfo && (
        <div className="absolute top-12 left-4 p-4 bg-gray-900/80 text-white rounded-lg shadow-lg max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Model Information</h3>
            <button 
              onClick={toggleModelInfo}
              className="text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-xs space-y-1 text-gray-200">
            <div className="flex justify-between">
              <span>Triangles:</span>
              <span className="font-mono">{modelInfo.triangleCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Vertices:</span>
              <span className="font-mono">{modelInfo.vertexCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Materials:</span>
              <span className="font-mono">{modelInfo.materialCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Textures:</span>
              <span className="font-mono">{modelInfo.textureCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Animations:</span>
              <span className="font-mono">{modelInfo.animationCount}</span>
            </div>
            {modelInfo.generator && (
              <div className="pt-1 border-t border-gray-700 mt-1">
                <div className="flex justify-between">
                  <span>Generator:</span>
                  <span className="font-mono text-xs max-w-[150px] truncate">{modelInfo.generator}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Controls hint */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 text-white pointer-events-none text-center text-xs">
        <span className="opacity-70">Drag to rotate • Scroll to zoom • Shift+drag to pan</span>
      </div>
    </div>
  );
}; 