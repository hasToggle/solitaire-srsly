"use client";

import { useGameState } from "./game-state-context";
import Card from "@/components/card";

export default function Foundation() {
  const {
    foundation: { cards: foundationCards, handleSelection },
  } = useGameState();
  return (
    <div className="col-span-4 grid grid-cols-4 gap-1">
      {foundationCards.map((cardStack, cardIndex) => (
        <Card
          key={cardIndex}
          className={"text-4xl"}
          card={cardStack[cardStack.length - 1]}
          onClick={() =>
            handleSelection(cardIndex, Math.max(0, cardStack.length - 1))
          }
        />
      ))}
    </div>
  );
}
