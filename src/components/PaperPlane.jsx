import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Reusable PaperPlane component for React Three Fiber (R3F).
 * Holographic transparent style with dual glowing jetstreams.
 */
export const PaperPlane = ({
  radius = 2.1,
  speed = 0.3,
  color = '#00e5ff',
  fillColor = '#818cf8',
  opacity = 0.15,
  trailLength = 60,
  pathType = 'figure8',
  scrollVelocityRef = null, // Mutable ref: scroll velocity for nose-tilt
}) => {
  const groupRef = useRef();
  const trailLeftRef = useRef();
  const trailRightRef = useRef();
  const smoothPitch = useRef(0); // Smoothed pitch tilt angle

  // 1. Geometri Pesawat (Runcing & Aerodinamis)
  const planeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Sayap Kiri
      0, 0, 0.6, -0.5, 0.1, -0.3, 0, 0, -0.2,
      // Sayap Kanan
      0, 0, 0.6, 0, 0, -0.2, 0.5, 0.1, -0.3,
      // Sirip Bawah Kiri (Keel)
      0, 0, 0.6, 0, 0, -0.2, 0, -0.2, -0.3,
      // Sirip Bawah Kanan
      0, 0, 0.6, 0, -0.2, -0.3, 0, 0, -0.2,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // 2. Geometri Garis Tepi (Wireframe)
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0.6, -0.5, 0.1, -0.3, // Luar kiri
      -0.5, 0.1, -0.3, 0, 0, -0.2, // Belakang kiri
      0, 0, 0.6, 0.5, 0.1, -0.3,  // Luar kanan
      0.5, 0.1, -0.3, 0, 0, -0.2, // Belakang kanan
      0, 0, 0.6, 0, 0, -0.2,      // Lipatan tengah
      0, 0, 0.6, 0, -0.2, -0.3,   // Bawah sirip
      0, 0, -0.2, 0, -0.2, -0.3,  // Belakang sirip vertikal
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  // 3. Geometri Jejak (Dual Trails memudar perlahan)
  const { trailGeoLeft, trailGeoRight } = useMemo(() => {
    const createTrail = () => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(trailLength * 3);
      const colors = new Float32Array(trailLength * 3);

      const baseColor = new THREE.Color(color);
      for (let i = 0; i < trailLength; i++) {
        // Kurva rasio kuadrat agar ujung jejak memudar lebih natural
        const ratio = Math.pow(i / (trailLength - 1), 2);
        const c = baseColor.clone().multiplyScalar(ratio);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return geo;
    };
    return { trailGeoLeft: createTrail(), trailGeoRight: createTrail() };
  }, [trailLength, color]);

  const historyLeft = useRef([]);
  const historyRight = useRef([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() * speed;
    const scrollVel = scrollVelocityRef ? scrollVelocityRef.current : 0;

    let x, y, z;
    let targetX, targetY, targetZ;
    let bankAngle = 0;

    if (pathType === 'figure8') {
      x = Math.sin(time) * 3.4;
      y = Math.sin(time * 2) * 1.3;
      z = Math.cos(time) * 1.2;

      const nextTime = time + 0.03;
      targetX = Math.sin(nextTime) * 3.4;
      targetY = Math.sin(nextTime * 2) * 1.3;
      targetZ = Math.cos(nextTime) * 1.2;

      bankAngle = -Math.cos(time) * 0.8;
    } else {
      const cosT = Math.cos(time);
      const sinT = Math.sin(time);
      x = cosT * radius;
      z = sinT * radius;
      y = sinT * 0.8 + Math.cos(time * 2.5) * 0.25;

      const nextTime = time + 0.03;
      targetX = Math.cos(nextTime) * radius;
      targetZ = Math.sin(nextTime) * radius;
      targetY = Math.sin(nextTime * 0.8) + Math.cos(nextTime * 2.5) * 0.25;

      bankAngle = -0.4; // Kemiringan stabil ke dalam saat orbit
    }

    // Move & orient plane
    groupRef.current.position.set(x, y, z);
    groupRef.current.lookAt(targetX, targetY, targetZ);
    groupRef.current.rotateZ(bankAngle);

    // Smooth nose-tilt: lerp towards scroll velocity (positive = scroll down = nose down)
    smoothPitch.current += (scrollVel * 0.55 - smoothPitch.current) * 0.12;
    groupRef.current.rotateX(smoothPitch.current);

    // Update Matrix untuk posisi sayap yang akurat setelah miring
    groupRef.current.updateMatrixWorld();
    const leftWingPos = new THREE.Vector3(-0.5, 0.1, -0.3).applyMatrix4(groupRef.current.matrixWorld);
    const rightWingPos = new THREE.Vector3(0.5, 0.1, -0.3).applyMatrix4(groupRef.current.matrixWorld);

    historyLeft.current.push(leftWingPos);
    historyRight.current.push(rightWingPos);

    if (historyLeft.current.length > trailLength) historyLeft.current.shift();
    if (historyRight.current.length > trailLength) historyRight.current.shift();

    // Render ulang posisi vertex jejak Kiri
    if (trailLeftRef.current && historyLeft.current.length > 0) {
      const posAttr = trailLeftRef.current.geometry.attributes.position;
      const len = historyLeft.current.length;
      for (let i = 0; i < trailLength; i++) {
        const point = historyLeft.current[Math.max(0, len - trailLength + i)] || leftWingPos;
        posAttr.setXYZ(i, point.x, point.y, point.z);
      }
      posAttr.needsUpdate = true;
    }

    // Render ulang posisi vertex jejak Kanan
    if (trailRightRef.current && historyRight.current.length > 0) {
      const posAttr = trailRightRef.current.geometry.attributes.position;
      const len = historyRight.current.length;
      for (let i = 0; i < trailLength; i++) {
        const point = historyRight.current[Math.max(0, len - trailLength + i)] || rightWingPos;
        posAttr.setXYZ(i, point.x, point.y, point.z);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Jejak Kiri (Additive Blending Glowing) */}
      <line ref={trailLeftRef} geometry={trailGeoLeft}>
        <lineBasicMaterial
          vertexColors={true}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Jejak Kanan (Additive Blending Glowing) */}
      <line ref={trailRightRef} geometry={trailGeoRight}>
        <lineBasicMaterial
          vertexColors={true}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Badan & Kerangka Pesawat */}
      <group ref={groupRef} scale={0.4}>
        {/* Panel pesawat semi-transparan */}
        <mesh geometry={planeGeometry}>
          <meshBasicMaterial
            color={fillColor}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending} // Membuat efek kaca hologram
          />
        </mesh>

        {/* Garis pinggir/Wireframe menyala */}
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial
            color={color}
            linewidth={2}
            transparent
            opacity={0.9}
          />
        </lineSegments>
      </group>
    </group>
  );
};

export default PaperPlane;