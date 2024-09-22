"use client";

import { useGameState } from "./game-state-context";
import Card from "@/components/card";
import Stack from "@/components/stack";
import EmptySlot from "@/components/empty-slot";

export default function Tableau() {
  const {
    tableau: { cards: tableauCards, handleSelection, handleSendToFoundation },
  } = useGameState();
  return (
    <div className="col-span-7 mt-2 grid grid-cols-7 gap-1">
      {tableauCards.map((cardStack, stackIndex) => (
        <Stack key={stackIndex}>
          {cardStack.length === 0 && (
            <EmptySlot onClick={() => handleSelection(stackIndex, 0)} />
          )}
          {cardStack.map((card, cardIndex) => (
            <Card
              key={cardIndex}
              card={card}
              className={"items-baseline text-base sm:text-lg md:text-xl"}
              onClick={() => handleSelection(stackIndex, cardIndex)}
              onDoubleClick={() =>
                handleSendToFoundation(stackIndex, cardIndex)
              }
            />
          ))}
        </Stack>
      ))}
    </div>
  );
}
