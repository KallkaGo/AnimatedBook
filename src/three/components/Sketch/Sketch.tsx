import {
  Environment,
  Float,
  OrbitControls,
  useEnvironment,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useInteractStore, useLoadedStore } from "@utils/Store";
import { useEffect, useRef } from "react";
import Book from "../Book/Book";

const Sketch = () => {
  const hdr = useEnvironment({ files: "/hdrs/studio.hdr" });

  const scene = useThree((state) => state.scene);

  const event = useThree((state) => state.events);

  const controlDom = useInteractStore((state) => state.controlDom);

  useEffect(() => {
    useLoadedStore.setState({ ready: true });
    scene.environment = hdr;
  }, []);

  useEffect(() => {
    controlDom && event.connect!(controlDom);
  }, [controlDom]);

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <ambientLight intensity={5} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      ></directionalLight>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={2}
        speed={2}
        rotationIntensity={2}
      >
        <Book />
      </Float>
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};

export default Sketch;
