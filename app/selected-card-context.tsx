"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { type Card } from "@/lib/types";
import { createDeck, shuffleDeck, createStacks } from "@/lib/cards";

interface SelectedCardContextType {
  cards: Card[][];
  selectedCard: Card | null;
  handleSelectCard: (card: Card | null, stackIndex: number) => void;
  handleGameReset: () => void;
}

const SelectedCardContext = createContext<SelectedCardContextType | undefined>(
  undefined
);

const deck = createDeck();

export const SelectedCardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[][]>(() =>
    createStacks(shuffleDeck(deck))
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleGameReset = () => {
    setCards(createStacks(shuffleDeck(deck)));
    setSelectedCard(null);
  };

  const handleSelectCard = (card: Card | null, stackIndex: number) => {
    if (selectedCard) {
      const newCards = cards.map((stack) =>
        stack.filter((c) => c !== selectedCard)
      );

      newCards[stackIndex].push(selectedCard);

      setCards(newCards);
      setSelectedCard(null);
    } else {
      if (card?.faceUp) setSelectedCard(card);
    }
  };

  return (
    <SelectedCardContext.Provider
      value={{ cards, selectedCard, handleSelectCard, handleGameReset }}
    >
      {children}
    </SelectedCardContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(SelectedCardContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedCard must be used within a SelectedCardProvider"
    );
  }
  return context;
};
