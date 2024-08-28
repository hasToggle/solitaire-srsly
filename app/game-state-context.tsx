"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Card,
  CardState,
  PlayingField,
  AllowedFieldsForMove,
  GameState,
  CardActionState,
} from "@/lib/types";
import {
  createDeck,
  shuffleDeck,
  createInitialState,
  DRAW,
  GOAL,
  MAIN,
} from "@/lib/cards";

interface GameStateContext {
  draw: {
    cards: CardState[][];
    handleSelection: () => void;
  };
  goal: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
  };
  main: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
  };
  selectedCard: CardActionState;
  getCard: (id: number | undefined) => Card | undefined;
  handleDrawCard: () => void;
  handleGameReset: () => void;
}

const GameStateContext = createContext<GameStateContext | undefined>(undefined);

const deck = createDeck();
const ids = deck.map((card) => card.id);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(
    createInitialState(shuffleDeck(ids)),
  );
  const [selectedCard, setSelectedCard] = useState<CardActionState>({
    state: [],
    action: () => {},
  });
  //derived state for telling when a game is finished
  const cardsFaceDown = 0;

  useEffect(() => {
    handleGameStart();
  }, []);

  const resetSelectedCard = () => {
    setSelectedCard({ state: [], action: () => {} });
  };

  const handleSelection = (
    field: PlayingField,
    column: number,
    row: number,
  ) => {
    const selectedField = gameState[field];
    /* Always select the last card in the stack */
    const selected = selectedField[column][selectedField[column].length - 1];
    if (selectedCard.state.length) {
      if (field === DRAW) {
        return resetSelectedCard();
      }
      if (!isMoveValid(field, selectedCard.state[0], selected)) {
        return resetSelectedCard();
      }

      selectedCard.action();

      /* Warning: You can't manipulate the current gameState here. You have to use the updater function! */
      setGameState((prevFields) => ({
        ...prevFields,
        [field]: prevFields[field].map((cardStack, col) => {
          if (col === column) {
            return cardStack.concat(selectedCard.state);
          }
          return cardStack;
        }),
      }));

      resetSelectedCard();
    } else {
      if (!selected || !selected.isFaceUp) {
        return;
      }

      const updatedField = selectedField.map((cardStack, col) => {
        if (col === column) {
          return cardStack
            .slice(0, row)
            .map((card, index, args) =>
              index < args.length - 1 ? card : { ...card, isFaceUp: true },
            );
        } else {
          return cardStack;
        }
      });

      const action = () => {
        setGameState((prevFields) => ({
          ...prevFields,
          [field]: updatedField,
        }));
      };

      const selectedCardStack = selectedField[column].slice(row);
      setSelectedCard({ state: selectedCardStack, action });
    }
  };

  const getCard = (id: number | undefined) => {
    if (!id) return;
    return deck.find((card) => card.id === id);
  };

  const isMoveValid = (
    field: AllowedFieldsForMove,
    top: CardState,
    bottom: CardState | undefined,
  ) => {
    const topCard = getCard(top?.id);
    const bottomCard = getCard(bottom?.id);

    if (!topCard) {
      return false;
    }

    const isGoalMoveValid = () => {
      // Moving to an empty spot: only an Ace can be moved
      const isTopCardAce = topCard.rank.value === 1;
      if (!bottomCard) return isTopCardAce;
      //if (bottomCard && isTopCardAce) return false;

      // Moving to a non-empty spot: check suit and rank
      const isSameSuit = topCard.suit.display === bottomCard.suit.display;
      const isRankOneMore = topCard.rank.value === bottomCard.rank.value + 1;

      return isSameSuit && isRankOneMore;
    };

    const isMainMoveValid = () => {
      // Moving to an empty spot: only a King can be moved
      if (!bottomCard) {
        return topCard.rank.value === 13;
      }

      // Moving to a spot with an Ace: only a King can be moved
      const isBottomCardAce = bottomCard.rank.value === 1;
      const isTopCardTwo = topCard.rank.value === 2;
      const isTopCardAce = topCard.rank.value === 1;

      if (isBottomCardAce) return isTopCardTwo;
      if (bottomCard && isTopCardAce) return false;

      // Moving to a non-empty spot: check rank and color
      const isDifferentColor = topCard.suit.color !== bottomCard.suit.color;
      const isRankOneLess = topCard.rank.value === bottomCard.rank.value - 1;

      return isDifferentColor && isRankOneLess;
    };

    switch (field) {
      case GOAL:
        return isGoalMoveValid();
      case MAIN:
        return isMainMoveValid();
      default:
        return false;
    }
  };

  const handleDrawCard = () => {
    resetSelectedCard();
    const [leftStack, rightStack] = gameState[DRAW];
    if (!rightStack.length) {
      if (leftStack.length) {
        let lastCard = leftStack[leftStack.length - 1];
        lastCard = { ...lastCard, isFaceUp: false };
        leftStack[leftStack.length - 1] = lastCard;
        const reversedStack = leftStack.slice().reverse();
        setGameState((prevFields) => ({
          ...prevFields,
          [DRAW]: [[], reversedStack],
        }));
      }
      return;
    }
    const updatedRightStack = rightStack.slice();
    const topCard = updatedRightStack.pop();
    const flippedTopCard = { ...topCard, isFaceUp: true } as CardState;
    const updatedLeftStack = leftStack.slice();
    updatedLeftStack.push(flippedTopCard);
    setGameState((prevFields) => ({
      ...prevFields,
      [DRAW]: [updatedLeftStack, updatedRightStack],
    }));
  };

  const handleGameStart = () => {
    const flipTopCards = setTimeout(() => {
      setGameState((prevFields) => ({
        ...prevFields,
        [MAIN]: prevFields[MAIN].map((cardStack) => {
          if (cardStack.length > 0) {
            cardStack[cardStack.length - 1].isFaceUp = true;
          }
          return cardStack;
        }),
      }));
      clearTimeout(flipTopCards);
    }, 250);
  };

  const handleGameReset = () => {
    setGameState(() => createInitialState(shuffleDeck(ids)));
    handleGameStart();
    resetSelectedCard();
  };

  const playingField = {
    [DRAW]: {
      cards: gameState[DRAW],
      handleSelection: handleSelection.bind(
        null,
        DRAW,
        0,
        gameState[DRAW][0].length - 1,
      ),
    },
    [GOAL]: {
      cards: gameState[GOAL],
      handleSelection: handleSelection.bind(null, GOAL),
    },
    [MAIN]: {
      cards: gameState[MAIN],
      handleSelection: handleSelection.bind(null, MAIN),
    },
  };

  return (
    <GameStateContext.Provider
      value={{
        selectedCard,
        getCard,
        handleDrawCard,
        handleGameReset,
        ...playingField,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedCard must be used within a SelectedCardProvider",
    );
  }
  return context;
};
