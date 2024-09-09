import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useInteractStore, useLoadedStore } from "@utils/Store";
import { useEffect, useRef } from "react";

const Sketch = () => {
  const controlDom = useInteractStore((state) => state.controlDom);

  useEffect(() => {
    useLoadedStore.setState({ ready: true });
  }, []);

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
    </>
  );
};

export default Sketch;
