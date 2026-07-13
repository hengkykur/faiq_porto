import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Inner model — auto-rotates slowly, but stops when user is dragging.
 * Loads the GLB file from the public folder.
 */
const Model = ({ isUserInteracting }) => {
  const { scene } = useGLTF('/network_sphere.glb');
  const groupRef = useRef(null);
  const introTime = useRef(0);

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

    // Spring scale intro animation: starts small, zooms in, overshoots, zooms out a bit, settles
    if (introTime.current < 2.5) {
      introTime.current += delta;
      
      const t = introTime.current;
      const decay = Math.exp(-2.2 * t);
      const osc = Math.cos(4.5 * t);
      const currentScale = 1.05 - decay * osc * 0.95;
      
      if (groupRef.current) {
        groupRef.current.scale.setScalar(currentScale);
      }
    } else if (introTime.current !== 999) {
      introTime.current = 999;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1.05);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.1}>
      <primitive object={scene} />
    </group>
  );
};

/**
 * FloatingDust Component
 * Renders 150 starry points floating gently in space to add depth
 */
const FloatingDust = () => {
  const pointsRef = useRef();
  const count = 150;

  const [positions] = React.useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8; // z
    }
    return pos;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const positionsArr = pointsRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const index = i * 3;
      // Gentle floating animation
      positionsArr[index + 1] += Math.sin(time + positionsArr[index]) * 0.0015;
      positionsArr[index] += Math.cos(time + positionsArr[index + 2]) * 0.0008;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.03}
        sizeAttenuation={true}
        transparent
        opacity={0.5}
      />
    </points>
  );
};

/**
 * GeometricCrystal Component
 * A rotating diamond satellite orbiting in a vertical plane
 */
const GeometricCrystal = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Orbit vertically (polar orbit)
    const radius = 1.67;
    const x = Math.sin(time * 0.4) * 0.4;
    const y = Math.cos(time * 0.4) * radius;
    const z = Math.sin(time * 0.4) * radius;
    
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x = time * 0.6;
    meshRef.current.rotation.y = time * 0.4;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.11, 0]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

/**
 * CubeSatellite Component
 * A small wireframe cube orbiting the sphere
 */
const CubeSatellite = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * 0.35;
    
    // Orbit path: tilted circular orbit matching the sphere's scale
    const radius = 1.41;
    const cosT = Math.cos(time);
    const sinT = Math.sin(time);
    const x = cosT * radius;
    const z = sinT * radius;
    const y = sinT * 0.6 + Math.cos(time * 2.0) * 0.2;
    
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x = time * 1.5;
    meshRef.current.rotation.y = time * 0.8;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.09, 0.09, 0.09]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.35}
        wireframe
      />
    </mesh>
  );
};

/**
 * TetrahedronSatellite Component
 * A small wireframe tetrahedron (3-sided pyramid)
 */
const TetrahedronSatellite = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const speed = 0.5;
    const radius = 1.9;
    
    // Diagonal tilted orbit
    const angle = time * speed;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;
    const z = Math.sin(angle) * radius * 0.8;
    
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x = time * 1.2;
    meshRef.current.rotation.y = time * 0.9;
  });

  return (
    <mesh ref={meshRef}>
      <tetrahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.35}
        wireframe
      />
    </mesh>
  );
};

/**
 * ConeSatellite Component
 * A small wireframe cone (square pyramid style)
 */
const ConeSatellite = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const speed = 0.28;
    const radius = 2.25;
    
    const angle = time * speed;
    const x = Math.sin(angle) * radius * 0.85;
    const y = Math.cos(angle) * radius * 0.5;
    const z = Math.sin(angle) * radius * 0.7;
    
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x = time * 0.8;
    meshRef.current.rotation.y = time * 1.1;
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.055, 0.125, 5]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.35}
        wireframe
      />
    </mesh>
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
        <FloatingDust />
        <CubeSatellite />
        <GeometricCrystal />
        <TetrahedronSatellite />
        <ConeSatellite />
      </Suspense>
    </Canvas>
  );
};

// Preload model agar tidak ada delay/flicker saat komponen dimuat
useGLTF.preload('/network_sphere.glb');

export default NetworkSphere;
