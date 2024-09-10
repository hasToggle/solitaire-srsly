"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
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
  handleTriggerAutocomplete: (shouldAutoComplete: boolean) => void;
  isHistoryEmpty: boolean;
  isAutoCompletePossible: boolean;
  elapsedTime: number;
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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runAutoMove, setRunAutoMove] = useState(false);
  const isGameFinished = useRef(false);
  const isAutoCompletePossible = useRef(false);

  //derived states
  const isHistoryEmpty = history.length === 0;
  isGameFinished.current = isEveryStackEmpty();

  function isEveryStackEmpty() {
    return [...gameState[MAIN], ...gameState[DRAW]].every(
      (stack) => !stack.length,
    );
  }

  useEffect(() => {
    handleGameStart();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        if (isGameFinished.current) {
          return clearInterval(interval);
        }
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        setElapsedTime(elapsedTime);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      setElapsedTime(0);
    };
  }, [startTime]);

  const checkCardsForGoalMove = useCallback((state: GameState) => {
    const topGoalCards = state[GOAL].map((stack) =>
      getCard(stack[stack.length - 1]?.id),
    ).filter(Boolean);

    const topBoardCards = [
      ...state[MAIN].map((stack) =>
        getCard(stack[stack.length - 1]?.id),
      ).filter(Boolean),
      ...[getCard(state[DRAW][0].at(-1)?.id)].filter(Boolean),
    ] as Card[];

    return topBoardCards.some((card) =>
      topGoalCards.some((goalCard) => isMoveValid(GOAL, card, goalCard)),
    );
  }, []);

  useEffect(() => {
    isAutoCompletePossible.current = checkCardsForGoalMove(gameState);
  }, [gameState]);

  /* this effect acts as a loop for sending cards to the goal field */
  useEffect(() => {
    const handleAutoMove = () => {
      if (runAutoMove && isAutoCompletePossible.current) {
        if (gameState[DRAW][0].length) {
          const from = {
            field: DRAW,
            column: 0,
            row: gameState[DRAW][0].length - 1,
          };
          moveToField(from, GOAL);
        }

        mainCheck: for (let i = 0; i < gameState[MAIN].length; i++) {
          const stack = gameState[MAIN][i];

          if (!stack.length) {
            continue mainCheck;
          }

          const from = { field: MAIN, column: i, row: stack.length - 1 };
          moveToField(from, GOAL);
        }
      } else {
        return handleTriggerAutocomplete(false);
      }
    };
    handleAutoMove();
  }, [runAutoMove, gameState]);

  const resetSelectedCard = () => {
    setSelected({ state: [], action: () => {} });
  };

  const handleTriggerAutocomplete = (shouldAutoComplete: boolean) => {
    setRunAutoMove(shouldAutoComplete);
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

    const from = { field, column, row };

    if (row !== gameState[field][column].length - 1) {
      moveToField(from, MAIN);
      return;
    }

    if (!moveToField(from, GOAL)) {
      moveToField(from, MAIN);
      return;
    }
  };

  function moveToField(from: CardPosition, toField: AllowedFieldsForMove) {
    const { field, column, row } = from;
    const selectedBottom = gameState[field][column][row];

    if (!selectedBottom || !selectedBottom.isFaceUp) {
      return false;
    }

    const bottomCard = getCard(selectedBottom.id);

    if (!bottomCard) {
      return false;
    }

    const stacks = gameState[toField];
    for (let i = 0; i < stacks.length; i++) {
      const stack = stacks[i];
      const topCard = getCard(stack[stack.length - 1]?.id);

      if (isMoveValid(toField, bottomCard, topCard)) {
        return handleMove(
          createCardMove([
            { field, column, row },
            { field: toField, column: i, row: stack.length },
          ]),
        );
      }
    }

    return false;
  }

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
    if (!startTime) setStartTime(Date.now());

    const { from } = cardMove;
    const { field, column, row } = from.pos;

    const selection = from.transform(gameState[field][column].slice(row));

    if (!selection?.length) {
      return false;
    }

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

    setHistory((prevHistory) => [...prevHistory, cardMove]);

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
    setStartTime(null);
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
        handleTriggerAutocomplete,
        isHistoryEmpty,
        isAutoCompletePossible: isAutoCompletePossible.current,
        elapsedTime,
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
