// src/components/Tech2.jsx
import React, { Suspense, useRef, useEffect, useState, memo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { technologies } from "../constants";

/* Hook estable para detectar si un elemento está en pantalla */
const useOnScreen = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // intencionalmente vacío para mantener estabilidad

  return isIntersecting;
};

/* Componente que carga y renderiza la geometría extruida del SVG.
   Está memoizado para evitar renders innecesarios desde el padre. */
const LogoExtruded = memo(function LogoExtruded({ icon, size = 1.2, thickness = 0.1, visible }) {
  const rootRef = useRef(); // para rotar
  const groupRef = useRef(); // donde añadimos la geometría
  const { invalidate } = useThree();

  // ref estable para invalidate (no poner invalidate en deps de efectos)
  const invalidateRef = useRef(invalidate);
  invalidateRef.current = invalidate;

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const addedGroupRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  /* Loop controlado para rotación a 30 FPS cuando visible.
     Este effect depende solo de `visible` para mantener orden de hooks. */
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (visible && mountedRef.current) {
      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        if (rootRef.current) {
          rootRef.current.rotation.y += 0.02;
          if (invalidateRef.current) invalidateRef.current();
        }
      }, 1000 / 30);

      if (invalidateRef.current) invalidateRef.current();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible]);

  /* Carga y creación de geometrías. deps explícitas y estables. */
  useEffect(() => {
    const loader = new SVGLoader();
    let cancelled = false;

    loader.load(
      icon,
      (data) => {
        if (cancelled || !mountedRef.current) return;

        try {
          const group = new THREE.Group();
          const createdGeometries = [];
          const createdMaterials = [];

          data.paths.forEach((path) => {
            const shapes = SVGLoader.createShapes(path);

            const geometries = shapes.map((shape) => {
              const g = new THREE.ExtrudeGeometry(shape, {
                depth: thickness,
                bevelEnabled: false,
                curveSegments: 3, // ultra low poly (pero bonito)
              });
              createdGeometries.push(g);
              return g;
            });

            const merged = mergeGeometries(geometries, true);

            const material = new THREE.MeshStandardMaterial({
              color: path.color || "#ffffff",
              roughness: 0.9,
              metalness: 0,
              side: THREE.DoubleSide,
            });
            createdMaterials.push(material);

            const mesh = new THREE.Mesh(merged, material);
            group.add(mesh);
          });

          group.rotation.x = Math.PI;
          const scale = size / 400;
          group.scale.set(scale, scale, 1);

          const box = new THREE.Box3().setFromObject(group);
          const center = new THREE.Vector3();
          box.getCenter(center);
          group.position.sub(center);

          if (groupRef.current) {
            groupRef.current.add(group);
            addedGroupRef.current = { group, createdGeometries, createdMaterials };
            if (invalidateRef.current) invalidateRef.current();
          } else if (rootRef.current) {
            rootRef.current.add(group);
            addedGroupRef.current = { group, createdGeometries, createdMaterials };
            if (invalidateRef.current) invalidateRef.current();
          } else {
            createdGeometries.forEach((g) => g.dispose && g.dispose());
            createdMaterials.forEach((m) => m.dispose && m.dispose());
            console.warn("LogoExtruded: no ref disponible para añadir geometría");
          }
        } catch (err) {
          console.error("LogoExtruded: error al procesar SVG", err);
        }
      },
      undefined,
      (err) => {
        if (!cancelled) console.error("SVG load error:", err);
      }
    );

    return () => {
      cancelled = true;
      const added = addedGroupRef.current;
      if (added && added.group) {
        try {
          if (added.group.parent) added.group.parent.remove(added.group);
          if (added.createdGeometries) {
            added.createdGeometries.forEach((g) => g && g.dispose && g.dispose());
          }
          if (added.createdMaterials) {
            added.createdMaterials.forEach((m) => m && m.dispose && m.dispose());
          }
        } catch (e) {
          // swallow
        }
        addedGroupRef.current = null;
      }
    };
  }, [icon, size, thickness]);

  return (
    <group ref={rootRef}>
      <group ref={groupRef} />
    </group>
  );
});

/* Componente por tarjeta que mantiene hooks en orden y es estable */
const LogoCard = ({ tech }) => {
  const containerRef = useRef(null);
  const visible = useOnScreen(containerRef);

  return (
    <div className="relative w-28 h-28" ref={containerRef}>
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
        <div
          className="w-[110px] h-[110px] rounded-full blur-2xl opacity-20"
          style={{
            background: tech.color || "#faf8e1",
            transform: "translateY(34px)",
          }}
        />
      </div>

      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 50 }}
        frameloop="demand"
        className="relative z-10"
        onCreated={(state) => {
          const gl = state.gl;
          const canvas = gl.domElement || gl.canvas;
          if (!canvas) return;
          const onLost = (e) => {
            e.preventDefault();
            console.warn("WebGL context lost (caught).");
          };
          const onRestored = () => {
            console.info("WebGL context restored.");
          };
          canvas.addEventListener("webglcontextlost", onLost, false);
          canvas.addEventListener("webglcontextrestored", onRestored, false);
          state.__cleanupWebGL = () => {
            canvas.removeEventListener("webglcontextlost", onLost);
            canvas.removeEventListener("webglcontextrestored", onRestored);
          };
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />

        <Suspense fallback={null}>
          <LogoExtruded icon={tech.icon} visible={visible} />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
};

const Tech2 = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((tech) => (
        <LogoCard key={tech.name} tech={tech} />
      ))}
    </div>
  );
};

export default Tech2;