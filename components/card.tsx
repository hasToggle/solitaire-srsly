"use client";

import clsx from "clsx";
import { useGameState } from "@/app/game-state-context";
import type { CardState } from "@/lib/types";
import EmptySlot from "./empty-slot";

export default function Card({
  card,
  className,
  onClick,
  onDoubleClick,
}: { card?: CardState } & React.HTMLProps<HTMLParagraphElement>) {
  const { selectedCard, getCard } = useGameState();
  const cardToDisplay = getCard(card?.id);

  if (cardToDisplay && card?.isFaceUp === false) {
    return <CardBack onClick={onClick} />;
  }

  if (!cardToDisplay) {
    return <EmptySlot onClick={onClick} />;
  }

  return (
    <div
      className={clsx(
        "flex h-20 w-12 select-none items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 pb-6 shadow-md sm:h-24 sm:w-16 md:h-32 md:w-20 lg:h-40 lg:w-24 lg:border-4 xl:h-56 xl:w-36",
        className,
        {
          "text-red-600":
            cardToDisplay?.suit.display === "♥️" ||
            cardToDisplay?.suit.display === "♦️",
          "text-black":
            cardToDisplay?.suit.display === "♠️" ||
            cardToDisplay?.suit.display === "♣️",
          "border-yellow-500 shadow-sm shadow-yellow-700":
            selectedCard.state?.some(
              (selected) => selected.id === cardToDisplay?.id,
            ),
        },
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {cardToDisplay?.suit.display}
      {cardToDisplay?.rank.display}
    </div>
  );
}

export function CardBack(props: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p
      className="my-auto flex h-20 w-12 select-none items-center justify-center overflow-hidden rounded-lg border-4 border-sky-400 bg-sky-700 pb-6 shadow-md sm:h-24 sm:w-16 md:h-32 md:w-20 lg:h-40 lg:w-24 xl:h-56 xl:w-36"
      {...props}
    >
      <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl">
        🎴
      </span>
    </p>
  );
}
