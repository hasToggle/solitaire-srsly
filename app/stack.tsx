"use client";

import clsx from "clsx";
import { type Card } from "@/lib/types";
import { useGameState } from "./selected-card-context";
/* 🎴 */
export const Stack = ({ cards, col }: { cards: Card[]; col: number }) => {
  const { selectedCard, handleSelectCard } = useGameState();

  return (
    <div className="">
      {cards.length === 0 && (
        <p
          className="bg-white pt-4 w-24 border-4 border-gray-200 rounded-lg shadow-md pb-12 flex items-center justify-center"
          onClick={() => handleSelectCard(null, col)}
        >
          <span className="text-7xl">🃏</span>
        </p>
      )}
      {cards.map((card, cardIndex) => (
        <>
          {!card.faceUp ? (
            <p
              key={cardIndex}
              onClick={() => handleSelectCard(card, col)}
              className={clsx(
                "bg-white pt-4 h-36 w-24 border-4 rounded-lg shadow-md pb-12 flex items-center justify-center"
              )}
            >
              <span className="text-7xl">🎴</span>
            </p>
          ) : (
            <p
              key={cardIndex}
              onClick={() => handleSelectCard(card, col)}
              className={clsx(
                "text-4xl bg-white pt-4 w-24 border-4 rounded-lg shadow-md pb-20 flex items-center justify-center",
                {
                  "text-red-600": card.suit === "♥️" || card.suit === "♦️",
                  "text-black": card.suit === "♠️" || card.suit === "♣️",
                  "border-sky-500": selectedCard === card,
                }
              )}
            >
              {card.rank}
              {card.suit}
            </p>
          )}
        </>
      ))}
    </div>
  );
};
