import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Rotating Cylinder that changes color based on integrity score
function WellboreCylinder({ integrityScore }) {
  const meshRef = useRef();

  // Rotate the cylinder
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  // Color based on integrity score
  const getColor = () => {
    if (integrityScore >= 80) return '#10b981'; // Green
    if (integrityScore >= 50) return '#f59e0b'; // Amber
    if (integrityScore >= 20) return '#ef4444'; // Red
    return '#7f1d1d'; // Dark Red (critical)
  };

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 4, 32]} />
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Grid helper for reference
function Grid() {
  return <gridHelper args={[10, 10, '#334155', '#1e293b']} />;
}

// Main Wellbore3D Component
const Wellbore3D = ({ integrityScore = 50, wellName = 'Unknown Well' }) => {
  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
      {/* Info Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wider">3D Wellbore</div>
        <div className="text-sm font-bold text-white mt-1">{wellName}</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="text-xs text-slate-400">Integrity:</div>
          <div
            className={`text-sm font-bold ${
              integrityScore >= 80
                ? 'text-green-400'
                : integrityScore >= 50
                ? 'text-amber-400'
                : integrityScore >= 20
                ? 'text-red-400'
                : 'text-red-600'
            }`}
          >
            {integrityScore}%
          </div>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ background: '#020617' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />

        {/* 3D Objects */}
        <WellboreCylinder integrityScore={integrityScore} />
        <Grid />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>

      {/* Controls Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2">
        <div className="text-xs text-slate-400 space-y-1">
          <div>🖱️ Drag: Rotate</div>
          <div>🔍 Scroll: Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default Wellbore3D;
