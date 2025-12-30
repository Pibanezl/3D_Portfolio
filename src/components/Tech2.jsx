// src/components/Tech2.jsx
import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { technologies } from "../constants";

const LogoExtruded = ({ icon, size = 1.2, thickness = 0.15 }) => {
  const ref = useRef();
  const groupRef = useRef();
  const { invalidate } = useThree();

  // Rotación suave solo cuando está visible
  useFrame((_, delta) => {
    if (ref.current?.visible) {
      ref.current.rotation.y += delta * 0.6;
      invalidate(); // render solo cuando cambia algo
    }
  });

  useEffect(() => {
    const loader = new SVGLoader();

    loader.load(
      icon,
      (data) => {
        const group = new THREE.Group();

        data.paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path);

          const geometries = shapes.map(
            (shape) =>
              new THREE.ExtrudeGeometry(shape, {
                depth: thickness,
                bevelEnabled: false,
                curveSegments: 4, // ⭐ reduce polígonos
              })
          );

          // ⭐ Merge por path → reduce draw calls
          const merged = mergeGeometries(geometries, true);

          const material = new THREE.MeshStandardMaterial({
            color: path.color || "#ffffff",
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });

          const mesh = new THREE.Mesh(merged, material);
          group.add(mesh);
        });

        // Corregir que el SVG viene invertido
        group.rotation.x = Math.PI;

        // Normalizar tamaño
        const scale = size / 400;
        group.scale.set(scale, scale, 1);

        // Centrar el grupo completo
        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.sub(center);

        groupRef.current.add(group);
        invalidate();
      },
      undefined,
      (err) => console.error("SVG load error:", err)
    );
  }, [icon]);

  return (
    <group ref={ref}>
      <group ref={groupRef} />
    </group>
  );
};

const Tech2 = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((tech) => (
        <div className="relative w-28 h-28" key={tech.name}>
          
          {/* Glow detrás del logo */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
            <div
              className="w-[120px] h-[120px] bg-[#faf8e1] rounded-full blur-2xl opacity-20"
              style={{ transform: "translateY(40px)" }}
            />
          </div>

          {/* Canvas optimizado */}
          <Canvas
            camera={{ position: [0, 0, 2.2], fov: 50 }}
            frameloop="demand" // ⭐ render solo cuando cambia algo
            className="relative z-10"
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />

            <Suspense fallback={null}>
              <LogoExtruded icon={tech.icon} />
            </Suspense>

            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      ))}
    </div>
  );
};

export default Tech2;