import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

/**
 * Inner model — auto-rotates slowly, but stops when user is dragging.
 * Loads the GLB file from the public folder.
 */
const Model = ({ isUserInteracting }) => {
  const { scene } = useGLTF('/network_sphere.glb');
  const groupRef = useRef(null);

  // Force all model materials to use clean white color
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh || child.isLine || child.isPoints || child.isLineSegments) {
          if (child.material) {
            const overrideColor = (mat) => {
              if (mat.color) mat.color.set('#ffffff');
              if (mat.emissive) mat.emissive.set('#000000'); // Disable colored emissive glow
            };
            if (Array.isArray(child.material)) {
              child.material.forEach(overrideColor);
            } else {
              overrideColor(child.material);
            }
          }
        }
      });
    }
  }, [scene]);

  useFrame((_, delta) => {
    // Only auto-rotate when user isn't manually dragging
    if (groupRef.current && !isUserInteracting.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Skala model bisa disesuaikan di sini */}
      <primitive object={scene} scale={1.5} />
    </group>
  );
};

/**
 * NetworkSphere
 * - Menggunakan GLB eksternal dengan React Three Fiber
 * - OrbitControls: drag untuk memutar, scroll untuk zoom
 */
const NetworkSphere = () => {
  const isUserInteracting = useRef(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 4.8], fov: 45 }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'auto',
        cursor: 'grab',
      }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />

      {/* OrbitControls — drag to rotate, scroll to zoom */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        enableDamping={true}
        dampingFactor={0.08}
        onStart={() => { isUserInteracting.current = true; }}
        onEnd={() => {
          // Small delay before re-enabling auto-rotate
          setTimeout(() => { isUserInteracting.current = false; }, 800);
        }}
      />

      <Suspense fallback={null}>
        <Model isUserInteracting={isUserInteracting} />
      </Suspense>
    </Canvas>
  );
};

// Preload model agar tidak ada delay/flicker saat komponen dimuat
useGLTF.preload('/network_sphere.glb');

export default NetworkSphere;
