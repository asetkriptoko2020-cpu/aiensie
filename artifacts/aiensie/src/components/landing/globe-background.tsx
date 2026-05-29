import { useRef, useMemo, Suspense, Component, useState, useEffect, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class GlobeErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function GlobeWireframe() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={ref}>
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#1e40af" wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[1.95, 32, 32]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} />
      </Sphere>
      {[0, 30, 60, -30, -60].map((lat, i) => (
        <mesh
          key={`lat-${i}`}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, Math.sin((lat * Math.PI) / 180) * 2, 0]}
        >
          <ringGeometry
            args={[
              Math.cos((lat * Math.PI) / 180) * 2 - 0.01,
              Math.cos((lat * Math.PI) / 180) * 2,
              64,
            ]}
          />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function OrbitingParticles() {
  const ref = useRef<THREE.Points>(null);

  const particleCount = 100;
  const { positions, angles, radii, speeds } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ang = new Float32Array(particleCount);
    const rad = new Float32Array(particleCount);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      ang[i] = Math.random() * Math.PI * 2;
      rad[i] = 2.2 + Math.random() * 0.6;
      spd[i] = 0.1 + Math.random() * 0.3;
      const y = (Math.random() - 0.5) * 3;
      const r = Math.sqrt(rad[i] * rad[i] - y * y * 0.3);
      pos[i * 3] = Math.cos(ang[i]) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(ang[i]) * r;
    }
    return { positions: pos, angles: ang, radii: rad, speeds: spd };
  }, []);

  useFrame(() => {
    if (ref.current) {
      const posArr = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * 0.01;
        const y = posArr[i * 3 + 1];
        const r = Math.sqrt(radii[i] * radii[i] - y * y * 0.3);
        posArr[i * 3] = Math.cos(angles[i]) * r;
        posArr[i * 3 + 2] = Math.sin(angles[i]) * r;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}

function GlowingNodes() {
  const ref = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.02;
      return {
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ] as [number, number, number],
        scale: 0.03 + Math.random() * 0.02,
      };
    });
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
      ref.current.children.forEach((child, i) => {
        const scale =
          nodes[i].scale * (1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3);
        child.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={ref}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <GlobeWireframe />
      <ParticleField />
      <OrbitingParticles />
      <GlowingNodes />
    </>
  );
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <div
        className="w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.15 250) 0%, oklch(0.65 0.2 170) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full border-2 opacity-10"
        style={{ borderColor: "oklch(0.7 0.15 250)" }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full border opacity-10"
        style={{ borderColor: "oklch(0.65 0.2 170)" }}
      />
    </div>
  );
}

export function GlobeBackground() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {webglSupported === null ? null : webglSupported ? (
        <GlobeErrorBoundary fallback={<StaticFallback />}>
          <Suspense fallback={<StaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
              style={{ background: "transparent" }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
              }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </GlobeErrorBoundary>
      ) : (
        <StaticFallback />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 pointer-events-none" />
    </div>
  );
}
