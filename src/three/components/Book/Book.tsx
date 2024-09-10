import { pages } from "@/constant/book";
import { useCursor, useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useInteractStore } from "@utils/Store";
import { easing } from "maath";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  BoxGeometry,
  Vector3,
  Uint16BufferAttribute,
  Float32BufferAttribute,
  Bone,
  Skeleton,
  SkinnedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SkeletonHelper,
  SRGBColorSpace,
  MathUtils,
  RepeatWrapping,
  Color,
  Material,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useGSAP } from "@gsap/react";

interface IProps {
  number: number;
  front: string;
  back: string;
  [key: string]: any;
}

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05; // Controls the strength of the curve
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;

const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(Math.floor(x / SEGMENT_WIDTH), 0);
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);

pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const pageMaterials = [
  new MeshStandardMaterial({
    color: "white",
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: "white",
  }),
  new MeshStandardMaterial({
    color: "white",
  }),
];

const emissiveColor = new Color("orange");

const Page: React.FC<IProps> = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  ...props
}) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? ["/textures/kallka-book-cover-roughness.jpg"]
      : []),
  ]);

  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  if (pictureRoughness) {
    pictureRoughness.wrapS = pictureRoughness.wrapT = RepeatWrapping;
    pictureRoughness.center.set(0.5, 0.5);
    pictureRoughness.rotation = degToRad(45);
    pictureRoughness.repeat.set(3, 3);
  }

  const [highlight, setHighlight] = useState(false);

  useCursor(highlight);

  const groupRef = useRef(null);

  const baseParam = useRef({
    factor: 0,
  });

  const skinnedMeshRef = useRef<SkinnedMesh>();

  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i == 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skelecton = new Skeleton(bones);
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: "white",
        map: picture,
        ...(number === 0
          ? { roughnessMap: pictureRoughness }
          : { roughness: 0.1 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: "white",
        map: picture2,
        ...(number === pages.length - 1
          ? { roughnessMap: pictureRoughness }
          : { roughness: 0.1 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skelecton.bones[0]);
    mesh.bind(skelecton);
    return mesh;
  }, []);

  // useHelper(skinnedMeshRef as any, SkeletonHelper);

  useGSAP(
    () => {
      gsap.killTweensOf(baseParam.current);
      gsap.set(baseParam.current, {
        factor: 0,
      });

      gsap.to(baseParam.current, {
        factor: 1,
        duration: 0.34,
        ease: "power1.inOut",
      });
    },
    { dependencies: [opened] }
  );

  useFrame((state, delta) => {
    if (!skinnedMeshRef.current) return;

    const { factor } = baseParam.current;

    const emissiveIntensity = highlight ? 0.22 : 0;

    const mat = skinnedMeshRef.current.material as MeshStandardMaterial[];

    mat[4].emissiveIntensity = mat[5].emissiveIntensity = MathUtils.lerp(
      mat[4].emissiveIntensity,
      emissiveIntensity,
      0.1
    );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }

    const diff = +new Date() - turnedAt.current;

    let turningTime = Math.min(400, diff) / 400;

    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2.5 : Math.PI / 2.5;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }
    const bones = skinnedMeshRef.current.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? groupRef.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      rotationAngle *= factor;

      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      foldRotationAngle *= factor;

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
        } else {
          rotationAngle = 0;
        }

        foldRotationAngle = 0;
      }

      easing.dampAngle(
        target!.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target!.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  return (
    <group
      {...props}
      ref={groupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlight(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlight(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setHighlight(false);
        useInteractStore.setState({ curPage: opened ? number : number + 1 });
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + 0.02}
      ></primitive>
    </group>
  );
};

const Book = ({ ...props }) => {
  const page = useInteractStore((state) => state.curPage);

  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeOut: NodeJS.Timeout;

    const goToPage = () => {
      setDelayedPage((preState) => {
        if (preState === page) {
          return preState;
        } else {
          timeOut = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - preState) > 2 ? 50 : 150
          );

          if (page > preState) {
            return preState + 1;
          }
          return preState - 1;
        }
      });
    };

    goToPage();

    return () => clearTimeout(timeOut);
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((item, index) => {
        return (
          <Page
            key={index}
            number={index}
            opened={delayedPage > index}
            bookClosed={delayedPage === 0 || delayedPage === pages.length}
            page={delayedPage}
            {...item}
          />
        );
      })}
    </group>
  );
};

export default Book;
