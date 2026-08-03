import React, { useRef } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * Robot avatar built from the ORIGINAL (non-flattened) GLB: "Untitled.glb".
 * Head tracks cursor position smoothly (celingak-celinguk) while body stays static.
 */

const POSE = {
  head:      [0,     0,     0   ],
  chest:     [0,     0,     0   ],

  // shoulderL base Z = -2.031. Lower Z delta = arm hangs lower.
  // Z=+0.5 was too high (almost horizontal). Z~0 or negative = arm hangs down.
  shoulderL: [0,     0,     0.12],  // slight positive Z = push arm outward from body
  upperArmL: [0.2,   0,     0   ],
  forearmL:  [0.55,  0,     0   ],

  shoulderR: [0,     0,    -0.12],  // base is +2.012, so opposite sign
  upperArmR: [-0.3,  0,     0   ],
  forearmR:  [0.55,  0,     0   ],

  thighL:    [0,     0,     0   ],
  thighR:    [0,     0,     0   ],
};

function addRot(base, delta) {
  return [base[0] + (delta?.[0] || 0), base[1] + (delta?.[1] || 0), base[2] + (delta?.[2] || 0)];
}

export function AvatarModel(props) {
  const group = useRef();
  const headRef = useRef();
  const chestRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const forearmLRef = useRef();
  const forearmRRef = useRef();
  const thighLRef = useRef();
  const thighRRef = useRef();
  const { nodes, materials } = useGLTF('/Untitled.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Head tracks cursor (celingak-celinguk)
    if (headRef.current) {
      const targetY = state.pointer.x * 0.45;
      const targetX = -state.pointer.y * 0.25;
      headRef.current.rotation.y += (targetY - headRef.current.rotation.y) * 0.08;
      headRef.current.rotation.x += (targetX - headRef.current.rotation.x) * 0.08;
    }

    // 2. Chest micro-twist
    if (chestRef.current) {
      chestRef.current.rotation.y = addRot([-0.043, 0.034, 0.048], POSE.chest)[1] + Math.sin(t * 1.1) * 0.03;
    }

    // 3. Upper arm swing (only X rotation, stay in natural pose)
    if (armLeftRef.current) {
      armLeftRef.current.rotation.x = addRot([-0.019, 0.007, -0.903], POSE.upperArmL)[0] + Math.sin(t * 1.2) * 0.03;
    }
    if (armRightRef.current) {
      armRightRef.current.rotation.x = addRot([-0.116, 0.047, 0.909], POSE.upperArmR)[0] + Math.cos(t * 1.2) * 0.03;
    }
    if (forearmLRef.current) {
      forearmLRef.current.rotation.x = addRot([-0.039, 0.011, -0.284], POSE.forearmL)[0] + Math.sin(t * 1.4) * 0.03;
    }
    if (forearmRRef.current) {
      forearmRRef.current.rotation.x = addRot([-0.031, -0.002, 0.191], POSE.forearmR)[0] + Math.cos(t * 1.4) * 0.03;
    }

    // 4. Subtle hip flex
    if (thighLRef.current) {
      thighLRef.current.rotation.x = addRot([-0.252, 0.47, -3.121], POSE.thighL)[0] + Math.sin(t * 1.1) * 0.02;
    }
    if (thighRRef.current) {
      thighRRef.current.rotation.x = addRot([-3.118, -0.65, 0.089], POSE.thighR)[0] - Math.sin(t * 1.1) * 0.02;
    }
  });

  if (!nodes || !materials) return null;

  // Fine-tune grill slots material for deep recessed cutout look ("bolong")
  if (materials['Material.025']?.color) {
    materials['Material.025'].color.set('#084554');
  }
  if (materials['Material.039']?.color) {
    materials['Material.039'].color.set('#084554');
  }

  // Safe geometry helper
  const getGeo = (name) => nodes[name]?.geometry;
  // Safe material helper
  const getMat = (name, fallbackName) => materials[name] || materials[fallbackName] || null;

  return (
    <group ref={group} {...props} dispose={null} scale={0.78}>
      <Center>
        <group position={[0.228, 3.058, -0.007]} rotation={[0, 0.256, 0]} scale={0.627}>
          {/* ===== perut (torso / root) ===== */}
          <group position={[0.028, -0.12, -0.091]} rotation={[0.061, -0.037, -0.024]}>

            {/* ---- perut.001 (chest) ---- */}
            <group
              ref={chestRef}
              position={[0, 0.605, 0]}
              rotation={addRot([-0.043, 0.034, 0.048], POSE.chest)}
            >
              {/* ---- leher -> kepala ---- */}
              <group position={[0, 2.932, 0]} rotation={[-0.026, 0.003, -0.144]}>
                <group
                  ref={headRef}
                  position={[0, 0.277, 0]}
                  rotation={addRot([0.006, 0, 0.141], POSE.head)}
                >
                  {getGeo('Cube003') && <mesh geometry={getGeo('Cube003')} material={getMat('Material.001')} position={[0.009, 0.693, 0.011]} rotation={[0.001, 0, -0.019]} scale={[-0.923, -0.72, -0.494]} />}
                  {getGeo('Cube008') && <mesh geometry={getGeo('Cube008')} material={getMat('Material.039')} position={[-0.02, 0.356, 0.52]} rotation={[-3.141, 0, 0.019]} scale={[-0.527, -0.109, -0.016]} />}
                  {getGeo('Cylinder001') && <mesh geometry={getGeo('Cylinder001')} material={getMat('Material.031')} position={[-0.434, 0.922, 0.568]} rotation={[1.562, -0.019, 0]} scale={[-0.213, -0.019, -0.213]} />}
                  {getGeo('Cylinder002') && <mesh geometry={getGeo('Cylinder002')} material={getMat('Material.034')} position={[0.434, 0.906, 0.568]} rotation={[1.562, -0.019, 0]} scale={[-0.213, -0.019, -0.213]} />}
                  {(getGeo('Cylinder007_1') || getGeo('Cylinder007')) && <mesh geometry={getGeo('Cylinder007_1') || getGeo('Cylinder007')} material={getMat('Material.020')} position={[1.037, 1.335, 0.017]} rotation={[0.02, 0.046, -0.087]} scale={[0.026, 0.372, 0.019]} />}
                  {getGeo('Cylinder008') && <mesh geometry={getGeo('Cylinder008')} material={getMat('Material.021')} position={[-0.989, 1.372, 0.017]} rotation={[0.01, -0.005, 0.017]} scale={[0.026, 0.372, 0.019]} />}
                  {getGeo('Cylinder009') && <mesh geometry={getGeo('Cylinder009')} material={getMat('Material.038')} position={[-1.072, 0.807, 0.025]} rotation={[0.001, 0, -1.575]} scale={[0.236, 0.053, 0.236]} />}
                  {getGeo('Cylinder010') && <mesh geometry={getGeo('Cylinder010')} material={getMat('Material.036')} position={[1.09, 0.766, 0.016]} rotation={[0.001, 0, -1.575]} scale={[0.236, 0.053, 0.236]} />}
                  {getGeo('Cylinder011') && <mesh geometry={getGeo('Cylinder011')} material={getMat('Material.035')} position={[0.986, 0.751, 0.011]} rotation={[0.001, 0, -1.575]} scale={[0.337, 0.062, 0.337]} />}
                  {getGeo('Cylinder012') && <mesh geometry={getGeo('Cylinder012')} material={getMat('Material.037')} position={[-0.963, 0.788, 0.011]} rotation={[0.001, 0, -1.575]} scale={[0.337, 0.062, 0.337]} />}
                  {getGeo('Plane') && <mesh geometry={getGeo('Plane')} material={getMat('Material.030')} position={[-1, -2.286, 1.769]} rotation={[1.571, -0.019, 0]} scale={1.596} />}
                  {getGeo('Sphere002') && <mesh geometry={getGeo('Sphere002')} material={getMat('Material.018')} position={[1.075, 1.765, 0.039]} rotation={[0.001, 0, -0.019]} scale={-0.09} />}
                  {getGeo('Sphere003') && <mesh geometry={getGeo('Sphere003')} material={getMat('Material.019')} position={[-1.009, 1.803, 0.039]} rotation={[0.001, 0, -0.019]} scale={-0.09} />}
                </group>
              </group>

              {/* ---- pundak.l -> lenga.a.kir -> lengan.b.kir (left arm) ---- */}
              <group
                position={[0.142, 2.945, -0.014]}
                rotation={addRot([-0.047, 0.051, -2.031], POSE.shoulderL)}
              >
                <group
                  ref={armLeftRef}
                  position={[0, 1.732, 0]}
                  rotation={addRot([-0.019, 0.007, -0.903], POSE.upperArmL)}
                >
                  <group
                    ref={forearmLRef}
                    position={[0, 1.702, 0]}
                    rotation={addRot([-0.039, 0.011, -0.284], POSE.forearmL)}
                  >
                    <group position={[0, 1.338, 0]} rotation={[0.041, -0.011, -0.019]}>
                      {(getGeo('Cube013_1') || getGeo('Cube013')) && (
                        <mesh geometry={getGeo('Cube013_1') || getGeo('Cube013')} material={getMat('Material.011')} position={[3.851, 0.429, -0.261]} rotation={[-1.584, -0.111, -1.512]} scale={[0.287, 0.251, 0.576]} />
                      )}
                    </group>
                    {(getGeo('Cube002_1') || getGeo('Cube002')) && (
                      <mesh geometry={getGeo('Cube002_1') || getGeo('Cube002')} material={getMat('Material.007')} position={[0.042, 0.536, -0.001]} rotation={[0.022, 0.062, 0.053]} scale={[-0.432, -0.699, -0.508]} />
                    )}
                  </group>
                  {getGeo('Cylinder005') && <mesh geometry={getGeo('Cylinder005')} material={nodes.Cylinder005?.material || getMat('Material.005')} position={[0.094, 0.004, 0.041]} rotation={[-0.001, 0.062, -1.799]} scale={[0.246, 0.274, 0.246]} />}
                  {getGeo('Cylinder013') && <mesh geometry={getGeo('Cylinder013')} material={getMat('Material.005')} position={[-0.275, 0.141, 0.052]} rotation={[-3.136, -0.089, 1.799]} scale={[0.6, 0.381, 0.6]} />}
                  {getGeo('Cylinder015') && <mesh geometry={getGeo('Cylinder015')} material={getMat('Material.006')} position={[-0.016, 1.122, 0.017]} rotation={[0, 0.065, 2.913]} scale={[0.236, 0.968, 0.202]} />}
                </group>
              </group>

              {/* ---- pundak.kan -> lengan.a.kan -> lengan.b.kan (right arm) ---- */}
              <group
                position={[-0.065, 2.972, 0.001]}
                rotation={addRot([-0.049, -0.042, 2.012], POSE.shoulderR)}
              >
                <group
                  ref={armRightRef}
                  position={[0, 1.761, 0]}
                  rotation={addRot([-0.116, 0.047, 0.909], POSE.upperArmR)}
                >
                  <group
                    ref={forearmRRef}
                    position={[0, 1.78, 0]}
                    rotation={addRot([-0.031, -0.002, 0.191], POSE.forearmR)}
                  >
                    <group position={[0, 1.213, 0]} rotation={[-0.051, 0.016, 0.067]}>
                      {(getGeo('Cube014_1') || getGeo('Cube014')) && (
                        <mesh geometry={getGeo('Cube014_1') || getGeo('Cube014')} material={getMat('Material.011')} position={[0.007, 0.177, -0.004]} rotation={[-1.513, 0.04, -1.779]} scale={[0.287, 0.251, 0.576]} />
                      )}
                    </group>
                    {getGeo('Cube') && <mesh geometry={getGeo('Cube')} material={getMat('Material.009')} position={[-0.066, 0.453, 0.006]} rotation={[0.013, -0.173, -0.013]} scale={[-0.432, -0.699, -0.508]} />}
                  </group>
                  {getGeo('Cylinder') && <mesh geometry={getGeo('Cylinder')} material={getMat('Material.008')} position={[0.314, 0.114, 0.094]} rotation={[0.015, -0.17, -1.371]} scale={[0.6, 0.381, 0.6]} />}
                  {getGeo('Cylinder004') && <mesh geometry={getGeo('Cylinder004')} material={nodes.Cylinder004?.material || getMat('Material.008')} position={[-0.04, -0.011, -0.004]} rotation={[-3.121, 0.197, 1.369]} scale={[0.246, 0.274, 0.246]} />}
                  {getGeo('Cylinder014') && <mesh geometry={getGeo('Cylinder014')} material={getMat('Material.010')} position={[0.041, 1.085, 0.009]} rotation={[0.015, -0.17, -2.941]} scale={[0.236, 0.522, 0.202]} />}
                </group>
              </group>

              {/* chest body meshes (panel, tombol, dll) */}
              {getGeo('Cube001') && <mesh geometry={getGeo('Cube001')} material={getMat('Material.002')} position={[-0.027, 1.48, 0.037]} rotation={[-0.018, 0.062, 3.12]} scale={[-1.409, -1.409, -0.684]} />}
              {/* Dark backing plate to make grill slots appear dark, recessed & hollow ("bolong gelap") */}
              <mesh position={[0.006, 1.45, 0.71]} rotation={[3.124, -0.062, -3.12]} scale={[-1.15, -0.8, -0.02]}>
                <boxGeometry />
                <meshStandardMaterial color="#04323e" roughness={0.9} />
              </mesh>
              {getGeo('Cube015') && <mesh geometry={getGeo('Cube015')} material={getMat('Material.025')} position={[0.006, 1.45, 0.745]} rotation={[3.124, -0.062, -3.12]} scale={[-1.156, -0.804, -0.034]} />}
              {getGeo('Cylinder019') && <mesh geometry={getGeo('Cylinder019')} material={getMat('Material.028')} position={[0.799, 1.748, 0.747]} rotation={[-1.562, 0.023, 0.062]} scale={[0.224, 0.05, 0.224]} />}
              {getGeo('Cylinder020') && <mesh geometry={getGeo('Cylinder020')} material={getMat('Material.029')} position={[0.783, 1.019, 0.761]} rotation={[-1.562, 0.023, 0.062]} scale={[0.224, 0.05, 0.224]} />}
              {getGeo('Cylinder021') && <mesh geometry={getGeo('Cylinder021')} material={getMat('Material.026')} position={[0.803, 1.75, 0.824]} rotation={[-1.562, 0.023, 0.062]} scale={[0.173, 0.039, 0.173]} />}
              {getGeo('Cylinder022') && <mesh geometry={getGeo('Cylinder022')} material={getMat('Material.027')} position={[0.788, 1.022, 0.838]} rotation={[-1.562, 0.023, 0.062]} scale={[0.173, 0.039, 0.173]} />}
            </group>

            {/* ---- paha.kir.001 -> kak.kiri (left leg) ---- */}
            <group
              ref={thighLRef}
              position={[0.763, 0.157, 0.031]}
              rotation={addRot([-0.252, 0.47, -3.121], POSE.thighL)}
            >
              <group position={[0, 0.633, 0]} rotation={[-0.249, 0.068, 0.098]}>
                {getGeo('Cube005') && <mesh geometry={getGeo('Cube005')} material={getMat('Material.004')} position={[0.006, 1.294, -0.13]} rotation={[0.121, 0.249, -0.021]} scale={[-0.447, -1.291, -0.523]} />}
                {getGeo('Cube010') && <mesh geometry={getGeo('Cube010')} material={getMat('Material.014')} position={[-0.02, 2.116, -0.057]} rotation={[0.121, 0.271, 3.124]} scale={[0.587, 0.329, 0.69]} />}
                {getGeo('Cube011') && <mesh geometry={getGeo('Cube011')} material={getMat('Material.016')} position={[0.019, 2.564, -0.004]} rotation={[0.121, 0.249, 3.124]} scale={[0.739, 0.091, 0.768]} />}
              </group>
              {getGeo('Cylinder017') && <mesh geometry={getGeo('Cylinder017')} material={getMat('Material.012')} position={[-0.023, 0.313, -0.227]} rotation={[-0.23, 0.678, -2.989]} scale={[-0.308, -0.475, -0.263]} />}
            </group>
            {getGeo('Cube004') && <mesh geometry={getGeo('Cube004')} material={getMat('Material.022')} position={[0.019, 0.492, 0.036]} rotation={[-0.065, 0.177, 0.027]} scale={[1.12, 0.243, 0.504]} />}
          </group>

          {/* ---- paha.kan -> kaki.kan (right leg) ---- */}
          <group
            ref={thighRRef}
            position={[-0.698, 0.046, 0.178]}
            rotation={addRot([-3.118, -0.65, 0.089], POSE.thighR)}
          >
            <group position={[0, 0.645, 0]} rotation={[0.047, -0.004, -0.09]}>
              {getGeo('Cube006') && <mesh geometry={getGeo('Cube006')} material={getMat('Material.003')} position={[0.09, 1.291, -0.014]} rotation={[3.046, -0.737, 3.065]} scale={[-0.447, -1.291, -0.523]} />}
              {getGeo('Cube007') && <mesh geometry={getGeo('Cube007')} material={getMat('Material.017')} position={[0.022, 2.565, -0.05]} rotation={[3.046, -0.737, -0.072]} scale={[0.739, 0.091, 0.768]} />}
              {getGeo('Cube009') && <mesh geometry={getGeo('Cube009')} material={getMat('Material.015')} position={[0.049, 2.243, -0.033]} rotation={[3.046, -0.737, -0.072]} scale={[0.587, 0.329, 0.69]} />}
            </group>
            {getGeo('Cylinder016') && <mesh geometry={getGeo('Cylinder016')} material={getMat('Material.013')} position={[0.104, 0.313, 0.049]} rotation={[-3.135, -0.925, 0.1]} scale={[-0.308, -0.475, -0.263]} />}
          </group>

          {getGeo('Cylinder006') && <mesh geometry={getGeo('Cylinder006')} material={getMat('Material.024')} position={[-0.031, 3.598, 0.003]} scale={[-0.297, -0.111, -0.37]} />}
          {getGeo('Cylinder018') && <mesh geometry={getGeo('Cylinder018')} material={getMat('Material.023')} position={[-0.031, 3.383, 0.003]} scale={[-0.389, -0.145, -0.486]} />}
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload('/Untitled.glb');
