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
  CardActionState,
  PlayingField,
  AllowedFieldsForMove,
  CardPosition,
  CardMove,
  GameState,
} from "@/lib/types";
import {
  DRAW,
  GOAL,
  MAIN,
  isMoveValid,
  createDeck,
  shuffleDeck,
  createInitialState,
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
  handleUndo: () => void;
  isHistoryEmpty: boolean;
}

const GameStateContext = createContext<GameStateContext | undefined>(undefined);

const deck = createDeck();
const ids = deck.map((card) => card.id);

const getCard = (id: number | undefined) => {
  if (!id) return;
  return deck.find((card) => card.id === id);
};

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(
    createInitialState(shuffleDeck(ids)),
  );
  const [selected, setSelected] = useState<CardActionState>({
    state: [],
    action: () => {},
  });
  const [history, setHistory] = useState<CardMove[]>([]);
  const isHistoryEmpty = history.length === 0;
  //derived state for telling when a game is finished
  const cardsFaceDown = 0;

  useEffect(() => {
    handleGameStart();
  }, []);

  const resetSelectedCard = () => {
    setSelected({ state: [], action: () => {} });
  };

  const handleSelection = (
    field: PlayingField,
    column: number,
    row: number,
  ) => {
    const selectedStack = gameState[field][column];
    if (selected.state.length) {
      if (field === DRAW) {
        return resetSelectedCard();
      }

      const topCardOfStack = getCard(
        selectedStack[selectedStack.length - 1]?.id,
      );
      const bottomCardOfSelection = getCard(selected.state[0]?.id);

      if (!isMoveValid(field, bottomCardOfSelection, topCardOfStack)) {
        return resetSelectedCard();
      }

      const CardPos = selected.action()!;

      handleMove(createCardMove([CardPos, { field, column, row }]));
      resetSelectedCard();
    } else {
      const selection = selectedStack[row];
      if (!selection || !selection.isFaceUp) {
        return;
      }

      const action = () => ({ field, column, row });

      const selectedCardStack = selectedStack.slice(row);
      setSelected({ state: selectedCardStack, action });
    }
  };

  const moveSelection = (field: PlayingField, column: number, row: number) => {
    resetSelectedCard();
    const selectedStack = gameState[field][column];
    const selectedBottom = selectedStack[row];

    if (!selectedBottom || !selectedBottom.isFaceUp) {
      return;
    }

    const bottomCard = getCard(selectedBottom.id);

    if (!bottomCard) {
      return;
    }

    if (row !== selectedStack.length - 1) {
      moveToField(MAIN);
      return;
    }

    if (!moveToField(GOAL)) {
      moveToField(MAIN);
      return;
    }

    function moveToField(targetField: AllowedFieldsForMove) {
      const stacks = gameState[targetField];
      for (let i = 0; i < stacks.length; i++) {
        const stack = stacks[i];
        const topCard = getCard(stack[stack.length - 1]?.id);

        if (isMoveValid(targetField, bottomCard, topCard)) {
          return handleMove(
            createCardMove([
              { field, column, row },
              { field: targetField, column: i, row: stack.length },
            ]),
          );
        }
      }

      return false;
    }
  };

  /* acts as a controller; accepts one or two CardPositions; generates CardMove */
  const createCardMove = ([from, to]: CardPosition[]): CardMove => {
    const { field, column, row } = from;
    const isFaceUp = gameState[field][column][row - 1]?.isFaceUp;

    const flipLastCard = (stack: CardState[]) => {
      return stack.map((card, index, args) =>
        index === args.length - 1 && !isFaceUp
          ? { ...card, isFaceUp: !card.isFaceUp }
          : card,
      );
    };

    const flipAllCardsAndReverseStack = (stack: CardState[]) =>
      stack.map((card) => ({ ...card, isFaceUp: !card.isFaceUp })).reverse();

    const effect = (stack: CardState[]) =>
      field === "main" ? flipLastCard(stack) : stack;

    const { field: toField, column: toColumn } = to;

    const transform = (stack: CardState[]) => {
      if (toField === "draw" && toColumn === 0) {
        return flipLastCard(stack);
      }
      if (toField === "draw" && toColumn === 1) {
        return flipAllCardsAndReverseStack(stack);
      }
      return stack;
    };

    return {
      from: {
        pos: { field, column, row },
        effect,
        transform: (stack: CardState[]) => stack,
      },
      to: {
        pos: {
          field: toField,
          column: toColumn,
          row: gameState[toField][toColumn].length,
        },
        effect: (stack: CardState[]) => stack,
        transform,
      },
    };
  };

  /* --- START ___Core Logic___ START --- */

  const handleMove = (cardMove: CardMove) => {
    const { from } = cardMove;
    const { field, column, row } = from.pos;

    const selection = from.transform(gameState[field][column].slice(row));

    setGameState((prevFields) => ({
      ...prevFields,
      [field]: prevFields[field].map((cardStack, col) => {
        if (col === column) {
          return from.effect(cardStack.slice(0, row));
        } else {
          return cardStack;
        }
      }),
    }));

    if (!selection?.length) {
      return false;
    }

    const { to } = cardMove;
    const { field: toField, column: toColumn } = to.pos;

    setGameState((prevFields) => ({
      ...prevFields,
      [toField]: prevFields[toField].map((cardStack, col) => {
        if (col === toColumn) {
          return to.effect(cardStack).concat(to.transform(selection));
        }
        return cardStack;
      }),
    }));

    setHistory([...history, cardMove]);

    return true;
  };

  /* --- END ___Core Logic___ END --- */

  const handleUndo = () => {
    const newHistory = history.slice();
    const lastMove = newHistory.pop();
    if (!lastMove) {
      return;
    }
    const { from, to } = lastMove;
    const successful = handleMove({ from: to, to: from });
    if (successful) setHistory(newHistory);
  };

  const handleDrawCard = () => {
    resetSelectedCard();
    const [leftStack, rightStack] = gameState[DRAW];
    if (!rightStack.length) {
      if (leftStack.length) {
        return handleMove(
          createCardMove([
            {
              field: DRAW,
              column: 0,
              row: 0,
            },
            { field: DRAW, column: 1, row: 0 },
          ]),
        );
      }
      return;
    }

    return handleMove(
      createCardMove([
        {
          field: DRAW,
          column: 1,
          row: rightStack.length - 1,
        },
        { field: DRAW, column: 0, row: leftStack.length },
      ]),
    );
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
      handleSendToGoal: moveSelection.bind(
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
      handleSendToGoal: moveSelection.bind(null, MAIN),
    },
  };

  return (
    <GameStateContext.Provider
      value={{
        selectedCard: selected,
        getCard,
        handleDrawCard,
        handleGameReset,
        handleUndo,
        isHistoryEmpty,
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
