import { PointerEvent, useEffect, useRef, useState } from "react";
import { useGameStore, useInteractStore } from "@utils/Store";
import { GameWrapper } from "./style";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Game = () => {
  const controlRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const aniDone = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    gsap.set(gameRef.current, { opacity: 0 });
    gsap.to(gameRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        aniDone.current = true;
      },
    });
  });

  useEffect(() => {
    useInteractStore.setState({ controlDom: controlRef.current! });
  }, []);

  const handlePointerEvent = (e: PointerEvent, flag: boolean) => {
    console.log(e.type, flag);
    useInteractStore.setState({ touch: flag });
  };

  const pageInfo = new Array(10).fill(undefined);

  return (
    <>
      <GameWrapper className="game" ref={gameRef}>
        <div
          className="control"
          ref={controlRef}
          onPointerDown={(e) => handlePointerEvent(e, true)}
          onPointerUp={(e) => handlePointerEvent(e, false)}
        ></div>
        <div className="slider">
          <div className="slider-container">
            {pageInfo.map((item, index) => {
              let buttonLabel;
              if (index === 0) {
                buttonLabel = "COVER";
              } else if (index === pageInfo.length - 1) {
                buttonLabel = "BACK COVER";
              } else {
                buttonLabel = `PAGE ${index}`;
              }
              return (
                <button
                  key={index}
                  style={{
                    backgroundColor:
                      index === activeIndex
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(0,0,0,0.3)",

                    color:
                      index === activeIndex
                        ? "rgba(0,0,0,1)"
                        : "rgba(255,255,255,1)",
                  }}
                  onClick={() => setActiveIndex(index)}
                >
                  {buttonLabel}
                </button>
              );
            })}
          </div>
        </div>
      </GameWrapper>
    </>
  );
};

export default Game;
