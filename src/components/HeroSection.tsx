import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Placeholder 3D Wellbore Component - to be replaced with actual wellbore simulation
function WellborePlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[1, 1, 4, 32]} />
      <meshStandardMaterial
        color="#0D9488"
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

// Safety Overlay Component
function SafetyOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-teal-500/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-teal-400 text-xs font-mono">PHYSICS_ENGINE_ACTIVE</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-orange-500/30 rounded-lg px-3 py-2">
        <div className="text-orange-400 text-xs font-mono">
          SAFETY_BOUNDS: ENFORCED
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-amber-500/30 rounded-lg px-3 py-2">
        <div className="text-amber-400 text-xs font-mono">
          REAL-TIME_VERIFICATION: 60fps
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <div className="text-slate-400 text-xs font-mono">
          mHC-GNN_LAYERS: 128
        </div>
      </div>
    </div>
  );
}

// 3D Scene Component
function WellboreScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #0A0E1A, #0F172A)' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0D9488" />

        <WellborePlaceholder />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <SafetyOverlay />
    </div>
  );
}

// Main Hero Section Component
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* 3D Visualization Container */}
      <div className="absolute inset-0 opacity-30">
        <WellboreScene />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Tagline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AI That Knows Physics
            <span className="block text-teal-400 mt-2">Can't Be Broken</span>
          </h1>

          {/* Subhead */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed">
            Offshore operations with guaranteed safety bounds. Enforcing physical laws where
            empirical data has decayed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-teal-500/50">
              Launch Platform Explorer
            </button>
            <button className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-lg border border-white/10 backdrop-blur-sm transition-all duration-200">
              View Technical Documentation
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 pt-12 opacity-70">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">99.7%</div>
              <div className="text-sm text-slate-400">Verification Rate</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">60fps</div>
              <div className="text-sm text-slate-400">Real-Time Processing</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">0</div>
              <div className="text-sm text-slate-400">Safety Incidents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-slate-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
}
