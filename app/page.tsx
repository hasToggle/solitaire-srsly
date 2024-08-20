"use client";

import clsx from "clsx";
import { Stack } from "./stack";
import { useGameState } from "./selected-card-context";

export default function Home() {
  const { cards, selectedCard } = useGameState();

  return (
    <main className="flex min-h-screen flex-col items-center gap-28 p-24">
      <div className="bg-white pt-4 w-24 h-36 border border-gray-200 rounded-lg shadow-md pb-20 flex items-center justify-center">
        <p
          className={clsx("text-4xl", {
            "text-red-600":
              selectedCard?.suit === "♥️" || selectedCard?.suit === "♦️",
            "text-black":
              selectedCard?.suit === "♠️" || selectedCard?.suit === "♣️",
          })}
        >
          {selectedCard?.rank}
          {selectedCard?.suit}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {cards.map((cardStack, cardIndex) => (
          <Stack key={cardIndex} cards={cardStack} col={cardIndex} />
        ))}
        {/* {Array.from({ length: stacks }, (_, i) => i + 1).map(
          (stackSize, stackIndex) => {
            const stackCards = cards.slice(startIndex, startIndex + stackSize);
            startIndex += stackSize;
            return <Stack key={stackIndex} cards={stackCards} />;
          }
        )} */}
      </div>
    </main>
  );
}
