"use client";

import { useGameState } from "./game-state-context";
import Card from "@/components/card";
import EmptySlot from "@/components/empty-slot";

export default function Stock() {
  const {
    stock: {
      cards: [leftStack, rightStack],
      handleSelection,
      handleSendToFoundation,
    },
    handleDrawCard,
  } = useGameState();
  return (
    <div className="col-span-2 grid grid-cols-2 gap-1">
      <div className="mt-5">
        {leftStack.length ? (
          <Card
            className={"text-xl md:text-2xl lg:text-4xl"}
            card={leftStack[leftStack.length - 1]}
            onClick={handleSelection}
            onDoubleClick={handleSendToFoundation}
          />
        ) : (
          <EmptySlot />
        )}
      </div>
      <div className="relative">
        <Card card={rightStack[0]} onClick={handleDrawCard} />
        <span className="absolute bottom-6 left-1 flex h-7 w-7 items-center justify-center rounded-md border border-sky-300 bg-sky-600 text-center text-xs text-sky-50 sm:text-sm md:h-9 md:w-9">
          {rightStack.length}
        </span>
      </div>
    </div>
  );
}
