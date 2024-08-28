import clsx from "clsx";
import { useGameState } from "@/app/game-state-context";
import type { CardState } from "@/lib/types";
import EmptySlot from "./empty-slot";

export default function Card({
  card,
  className,
  onClick,
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
        "flex h-36 w-24 select-none items-center justify-center rounded-lg border-4 border-gray-200 bg-white pb-12 shadow-md",
        className,
        {
          "text-red-600":
            cardToDisplay?.suit.display === "♥️" ||
            cardToDisplay?.suit.display === "♦️",
          "text-black":
            cardToDisplay?.suit.display === "♠️" ||
            cardToDisplay?.suit.display === "♣️",
          "border-sky-500": selectedCard.state?.some(
            (selected) => selected.id === cardToDisplay?.id,
          ),
        },
      )}
      onClick={onClick}
    >
      {cardToDisplay?.suit.display}
      {cardToDisplay?.rank.display}
    </p>
  );
}

export function CardBack(props: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p
      className="flex h-36 w-24 select-none items-center justify-center rounded-lg border-4 border-gray-200 bg-white pb-12 shadow-md"
      {...props}
    >
      <span className="text-7xl">🎴</span>
    </p>
  );
}
