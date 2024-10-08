import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useInteractStore } from "@utils/Store";
import { Perf } from "r3f-perf";
import { Leva } from "leva";
import Sketch from "./components/Sketch/Sketch";
export default function ThreeContainer() {
  const demand = useInteractStore((state) => state.demand);

  return (
    <>
      <Leva collapsed hidden={location.hash !== "#debug"} />
      <Canvas
        shadows
        frameloop={demand ? "never" : "always"}
        className="webgl"
        dpr={[1, 2]}
        camera={{
          fov: 45,
          near: 0.1,
          position: [-0.5, 1, 4],
          far: 500,
        }}
      >
        {location.hash.includes("debug") && <Perf position="top-left" />}
        <Suspense fallback={null}>
          <Sketch />
        </Suspense>
      </Canvas>
    </>
  );
}
