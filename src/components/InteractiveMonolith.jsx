import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Camera Controller — zooms in based on scrollProgress ── */
const CameraController = ({ scrollProgress }) => {
  const { camera } = useThree();
  const startZ = 15.0;
  const endZ = 0.15;

  useFrame(() => {
    const p = scrollProgress.current;
    // Ease-out curve to counteract perspective zoom acceleration
    const easedP = Math.sin(p * Math.PI / 2);
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, easedP);
    
    // Only update position if it changes significantly to prevent useless calculations
    const newZ = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.025);
    if (Math.abs(camera.position.z - newZ) > 0.0001) {
      camera.position.z = newZ;
    }

    // Eased FOV shift for dramatic tunnel feel - only update projection matrix when fov actually changes
    const targetFov = THREE.MathUtils.lerp(45, 75, easedP * easedP);
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
 };

/* ── Central Torus Knot with glowing edges ── */
const CentralShape = ({ scrollProgress, torusGeom }) => {
  const groupRef = useRef(null);
  const rotationGroupRef = useRef(null);
  const knotRef = useRef(null);

  useFrame((state, delta) => {
    const p = scrollProgress.current;
    const easedP = Math.sin(p * Math.PI / 2);

    // 1. Auto-rotation on the inner rotation group (all children rotate together)
    if (rotationGroupRef.current) {
      const rotSpeed = 0.15 + easedP * 2.5;
      rotationGroupRef.current.rotation.y += delta * rotSpeed;
      rotationGroupRef.current.rotation.x += delta * (0.05 + easedP * 0.8);
    }

    // 2. Slow, heavy mouse tracking on the outer group
    if (groupRef.current) {
      const mouseInfluence = 1 - easedP;
      // Scale mouse position and rotation bounds up to match the 24.0 starting camera distance
      const targetPosX = state.pointer.x * 2.0 * mouseInfluence;
      const targetPosY = state.pointer.y * 1.2 * mouseInfluence;
      const targetRotX = state.pointer.y * -0.32 * mouseInfluence;
      const targetRotY = state.pointer.x * 0.32 * mouseInfluence;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.03);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.03);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.03);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.03);
    }

    // 3. Scale up as camera approaches
    if (knotRef.current && rotationGroupRef.current) {
      const basePulse = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
      const portalScale = 1 + easedP * 1.5;
      rotationGroupRef.current.scale.setScalar(basePulse * portalScale);
    }
  });

  const edgesGeom = useMemo(() => {
    return new THREE.EdgesGeometry(torusGeom, 15);
  }, [torusGeom]);

  return (
    <group ref={groupRef}>
      <group ref={rotationGroupRef}>
        {/* Main Torus Knot — Piano Black Reflective */}
        <mesh ref={knotRef} geometry={torusGeom}>
          <meshPhysicalMaterial
            color="#020203"
            roughness={0.08}
            metalness={0.95}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            reflectivity={1.0}
          />
        </mesh>

        {/* Wireframe overlay — Cyan glow */}
        <WireframeOverlay scrollProgress={scrollProgress} torusGeom={torusGeom} />

        {/* Sharp outline edges — Crisp White/Silver for high-tech look */}
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </lineSegments>
      </group>
    </group>
  );
};

/* ── Wireframe that brightens during scroll ── */
const WireframeOverlay = ({ scrollProgress, torusGeom }) => {
  const matRef = useRef(null);

  useFrame(() => {
    if (matRef.current) {
      const p = scrollProgress.current;
      const easedP = Math.sin(p * Math.PI / 2);
      matRef.current.opacity = 0.2 + easedP * 0.55;
    }
  });

  return (
    <mesh geometry={torusGeom} scale={[1.003, 1.003, 1.003]}>
      <meshBasicMaterial ref={matRef} color="#00f0ff" wireframe transparent opacity={0.2} />
    </mesh>
  );
};

/* ── Orbiting Ring ── */
const OrbitRing = ({ radius, speed, tilt, color, opacity, scrollProgress }) => {
  const ringRef = useRef(null);

  const points = useMemo(() => {
    const pts = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((_, delta) => {
    if (ringRef.current) {
      const p = scrollProgress.current;
      ringRef.current.rotation.y += delta * (speed + p * 3);
      const s = 1 + p * 0.8;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ringRef} rotation={[tilt, 0, tilt * 0.5]}>
      <line geometry={points}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
    </group>
  );
};

/* ── Floating Particles — White stars ── */
const Particles = ({ scrollProgress }) => {
  const pointsRef = useRef(null);
  const lastPRef = useRef(-1);
  const count = 120;

  const { basePositions } = useMemo(() => {
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2.5;
      base[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      base[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      base[i * 3 + 2] = r * Math.cos(phi);
    }
    return { basePositions: base };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const p = scrollProgress.current;

    pointsRef.current.rotation.y += delta * (0.03 + p * 0.5);
    pointsRef.current.rotation.x += delta * (0.008 + p * 0.2);

    // Only update buffer attributes if p has changed to avoid heavy CPU-GPU syncs
    if (Math.abs(p - lastPRef.current) > 0.0001) {
      lastPRef.current = p;
      const geom = pointsRef.current.geometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        for (let i = 0; i < count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];
          posAttr.array[i * 3] = THREE.MathUtils.lerp(bx, bx * 0.05, p);
          posAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(by, by * 0.05, p);
          posAttr.array[i * 3 + 2] = THREE.MathUtils.lerp(bz, bz * 0.05 - 2, p);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[basePositions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.055}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

/* ── Main Component ── */
const InteractiveMonolith = ({ scrollProgress = 0 }) => {
  const internalRef = useRef(0);
  const progressRef = scrollProgress && typeof scrollProgress === 'object' && 'current' in scrollProgress
    ? scrollProgress
    : internalRef;

  // Keep fallback internalRef in sync if simple number is passed
  if (!(scrollProgress && typeof scrollProgress === 'object' && 'current' in scrollProgress)) {
    internalRef.current = scrollProgress;
  }

  const torusGeom = useMemo(() => new THREE.TorusKnotGeometry(0.85, 0.28, 128, 16, 2, 3), []);

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15.0], fov: 45 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'auto',
          cursor: 'grab',
        }}
      >
        <CameraController scrollProgress={progressRef} />

        {/* Clean, high-intensity neutral lighting for crisp reflections */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={3.5} color="#ffffff" />
        <pointLight position={[-5, -5, -2]} intensity={2.5} color="#00f0ff" />
        <pointLight position={[5, -5, 2]} intensity={2.0} color="#00f0ff" />

        <CentralShape scrollProgress={progressRef} torusGeom={torusGeom} />

        {/* Unified Cyan and White Orbiting rings */}
        <OrbitRing radius={1.8} speed={0.2} tilt={0.5} color="#00f0ff" opacity={0.2} scrollProgress={progressRef} />
        <OrbitRing radius={2.2} speed={-0.12} tilt={1.2} color="#ffffff" opacity={0.15} scrollProgress={progressRef} />
        <OrbitRing radius={2.6} speed={0.08} tilt={0.8} color="#00f0ff" opacity={0.1} scrollProgress={progressRef} />

        <Particles scrollProgress={progressRef} />
      </Canvas>
    </div>
  );
};

export default InteractiveMonolith;
