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
    <p
      className={clsx(
        "flex h-56 w-36 select-none items-center justify-center rounded-lg border-4 border-gray-200 bg-gray-100 pb-12 shadow-md",
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
    </p>
  );
}

export function CardBack(props: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p
      className="my-auto flex h-56 w-36 select-none items-center justify-center rounded-lg border-4 border-sky-400 bg-sky-700 pb-1 shadow-md"
      {...props}
    >
      <span className="text-9xl">🎴</span>
    </p>
  );
}
