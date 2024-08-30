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
  isMoveValid,
  DRAW,
  GOAL,
  MAIN,
} from "@/lib/utils";

interface GameStateContext {
  draw: {
    cards: CardState[][];
    handleSelection: () => void;
    handleSendToGoal: () => void;
  };
  goal: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
  };
  main: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
    handleSendToGoal: (column: number, row: number) => void;
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
    const selectedStack = gameState[field][column];
    if (selectedCard.state.length) {
      if (field === DRAW) {
        return resetSelectedCard();
      }

      const topCardOfStack = getCard(
        selectedStack[selectedStack.length - 1]?.id,
      );
      const bottomCardOfSelection = getCard(selectedCard.state[0]?.id);

      if (!isMoveValid(field, bottomCardOfSelection, topCardOfStack)) {
        return resetSelectedCard();
      }

      selectedCard.action();

      handlePaste(field, column, selectedCard.state);
      resetSelectedCard();
    } else {
      const selection = selectedStack[row];
      if (!selection || !selection.isFaceUp) {
        return;
      }

      const action = () => {
        handleCut(field, column, row);
      };

      const selectedCardStack = selectedStack.slice(row);
      setSelectedCard({ state: selectedCardStack, action });
    }
  };

  /* TODO: rename */
  const handleSendToGoal = (
    field: PlayingField,
    column: number,
    row: number,
  ) => {
    const selectedField = gameState[field];
    const selected = selectedField[column][row];
    resetSelectedCard();
    if (!selected || !selected.isFaceUp) {
      return;
    }

    const card = getCard(selected.id);

    if (!card) {
      return;
    }

    if (row !== selectedField[column].length - 1) {
      sendToField(MAIN, card);
      return;
    }
    const didSend = sendToField(GOAL, card);
    if (!didSend) {
      sendToField(MAIN, card);
      return;
    }

    function sendToField(targetField: AllowedFieldsForMove, bottomCard: Card) {
      const stacks = gameState[targetField];
      for (let i = 0; i < stacks.length; i++) {
        const stack = stacks[i];
        const topCard = getCard(stack[stack.length - 1]?.id);
        if (isMoveValid(targetField, bottomCard, topCard)) {
          const selection = handleCut(field, column, row);
          const didPaste = handlePaste(targetField, i, selection);
          return didPaste;
        }
      }
      return false;
    }
  };

  /* --- START ___Core Logic___ START --- */

  /* Cut selection from stack */
  const handleCut = (field: PlayingField, column: number, row: number) => {
    let selection = gameState[field][column].slice(row);
    setGameState((prevFields) => ({
      ...prevFields,
      [field]: prevFields[field].map((cardStack, col) => {
        if (col === column) {
          return cardStack
            .slice(0, row)
            .map((card, index, args) =>
              index < args.length - 1 ? card : { ...card, isFaceUp: true },
            );
        } else {
          return cardStack;
        }
      }),
    }));
    return selection;
  };

  /* Paste selection to stack */
  const handlePaste = (
    field: PlayingField,
    column: number,
    selection: CardState[],
  ) => {
    if (!selection?.length) {
      return false;
    }
    setGameState((prevFields) => ({
      ...prevFields,
      [field]: prevFields[field].map((cardStack, col) => {
        if (col === column) {
          return cardStack.concat(selection);
        }
        return cardStack;
      }),
    }));
    return true;
  };
  /* --- END ___Core Logic___ END --- */

  const getCard = (id: number | undefined) => {
    if (!id) return;
    return deck.find((card) => card.id === id);
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
      handleSendToGoal: handleSendToGoal.bind(
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
      handleSendToGoal: handleSendToGoal.bind(null, MAIN),
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
