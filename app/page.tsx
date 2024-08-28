"use client";

import { useGameState } from "./game-state-context";
import EmptySlot from "@/components/empty-slot";
import Stack from "@/components/stack";
import Card from "@/components/card";

export default function Home() {
  const {
    main: { cards: mainCards, handleSelection: handleMainSelection },
    draw: {
      cards: [leftStack, rightStack],
      handleSelection: handleDrawSelection,
    },
    goal: { cards: goalCards, handleSelection: handleGoalSelection },
    handleDrawCard,
    handleGameReset,
  } = useGameState();

  return (
    <main>
      <div className="grid min-h-screen grid-cols-12 p-24">
        <div className="col-span-6 col-start-2 grid grid-cols-4">
          {goalCards.map((cardStack, cardIndex) => (
            <Card
              key={cardIndex}
              card={cardStack[cardStack.length - 1]}
              onClick={() =>
                handleGoalSelection(
                  cardIndex,
                  Math.max(0, cardStack.length - 1),
                )
              }
              className={"text-4xl"}
            />
          ))}
        </div>
        <div className="col-span-6 col-start-9 grid grid-cols-2">
          <div className="mx-auto">
            {leftStack.length ? (
              <Card
                card={leftStack[leftStack.length - 1]}
                onClick={() => handleDrawSelection()}
                className={"text-4xl"}
              />
            ) : (
              <Stack />
            )}
          </div>
          <div>
            <Card card={rightStack[0]} onClick={handleDrawCard} />
          </div>
        </div>
        <div className="col-span-6 col-start-3 grid grid-cols-7 gap-2">
          {mainCards.map((cardStack, stackIndex) => (
            <Stack key={stackIndex}>
              {cardStack.length === 0 && (
                <EmptySlot onClick={() => handleMainSelection(stackIndex, 0)} />
              )}
              {cardStack.map((card, cardIndex) => (
                <Card
                  card={card}
                  key={cardIndex}
                  onClick={() => handleMainSelection(stackIndex, cardIndex)}
                  className={"items-baseline text-xl"}
                />
              ))}
            </Stack>
          ))}
        </div>
      </div>
      <button
        className="absolute bottom-5 left-1/2 -ml-4 rounded-md border border-green-300 px-8 py-1.5 text-green-950"
        onClick={handleGameReset}
      >
        Reset
      </button>
    </main>
  );
}
