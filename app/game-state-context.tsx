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
  Board,
  AllowedFieldsForMove,
  CardPosition,
  CardMove,
  GameState,
  GameStateContext,
} from "@/lib/types";
import {
  STOCK,
  FOUNDATION,
  TABLEAU,
  isMoveValid,
  createDeck,
  shuffleDeck,
  createInitialState,
} from "@/lib/utils";
import { saveCompletedGame } from "./action";

const GameStateContext = createContext<GameStateContext | undefined>(undefined);

const deck = createDeck();
const ids = deck.map((card) => card.id);

/* Retrieves all card information on the provided id. */
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
  const [isAutoCompletePossible, setIsAutoCompletePossible] = useState(false);
  const isGameFinished = useRef(false);

  // derived states
  const isHistoryEmpty = history.length === 0;
  isGameFinished.current = [...gameState[TABLEAU], ...gameState[STOCK]].every(
    (stack) => !stack.length,
  );

  /* START --- Core Logic --- START */

  /* Executes any move of cards considering potential side effects for the board. */
  const handleMove = useCallback(
    (cardMove: CardMove) => {
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
    },
    [gameState, startTime],
  );

  /* END --- Core Logic --- END */

  /* Creates a CardMove which includes the change in card position AND potential side effects. */
  const createCardMove = useCallback(
    ([from, to]: CardPosition[]): CardMove => {
      const { field, column, row } = from;
      const isFaceUp = gameState[field][column][row - 1]?.isFaceUp;

      const flipLastCard = (stack: CardState[]) => {
        return stack.map((card, index, args) =>
          index === args.length - 1 && !isFaceUp
            ? { ...card, isFaceUp: !card.isFaceUp }
            : card,
        );
      };

      const effect = (stack: CardState[]) =>
        field === TABLEAU ? flipLastCard(stack) : stack;

      const { field: toField, column: toColumn } = to;

      const flipAllCardsAndReverseStack = (stack: CardState[]) =>
        stack.map((card) => ({ ...card, isFaceUp: !card.isFaceUp })).reverse();

      const transform = (stack: CardState[]) => {
        if (toField === STOCK && toColumn === 0) {
          return flipLastCard(stack);
        }
        if (toField === STOCK && toColumn === 1) {
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
    },
    [gameState],
  );

  /* If possible, sends card(s) to the specified field obeying any applicable rules. */
  const moveToField = useCallback(
    (from: CardPosition, toField: AllowedFieldsForMove) => {
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
    },
    [createCardMove, gameState, handleMove],
  );

  /* Starts the game as soon as the app is ready initially. */
  useEffect(() => {
    handleGameStart();
  }, []);

  const handleSaveCompletedGame = useCallback(async () => {
    const cleanGameState: Partial<GameState> = {
      stock: [...gameState.stock],
      tableau: [...gameState.tableau],
    };
    cleanGameState[STOCK] = cleanGameState[STOCK]!.map((stack) =>
      stack.map((card) => ({ id: card.id }) as CardState),
    );
    cleanGameState[TABLEAU] = cleanGameState[TABLEAU]!.map((stack) =>
      stack.map((card) => ({ id: card.id }) as CardState),
    );
    const cleanHistory = history.map((move) => ({
      from: {
        pos: {
          field: move.from.pos.field,
          column: move.from.pos.column,
          row: move.from.pos.row,
        },
      },
      to: {
        pos: {
          field: move.to.pos.field,
          column: move.to.pos.column,
          row: move.to.pos.row,
        },
      },
    }));
    await saveCompletedGame(cleanGameState, cleanHistory);
  }, [gameState, history]);

  /* Starts a 1-second interval on the current game. */
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        if (isGameFinished.current) {
          clearInterval(interval);
          handleSaveCompletedGame();
          return;
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
  }, [startTime, handleSaveCompletedGame]);

  /* Checks if it is possible to send any card(s) to the foundation. */
  useEffect(() => {
    const topFoundationCards = gameState[FOUNDATION].map((stack) =>
      getCard(stack[stack.length - 1]?.id),
    ).filter(Boolean);

    const topBoardCards = [
      ...gameState[TABLEAU].map((stack) =>
        getCard(stack[stack.length - 1]?.id),
      ).filter(Boolean),
      ...[getCard(gameState[STOCK][0].at(-1)?.id)].filter(Boolean),
    ] as Card[];

    const canMoveToFoundation = topBoardCards.some((card) =>
      topFoundationCards.some((foundationCard) =>
        isMoveValid(FOUNDATION, card, foundationCard),
      ),
    );

    setIsAutoCompletePossible(canMoveToFoundation);
  }, [gameState]);

  /* This effect acts as a loop for sending cards to the foundation as long as runAutoMove is true. */
  useEffect(() => {
    if (runAutoMove && isAutoCompletePossible) {
      if (gameState[STOCK][0].length) {
        const from = {
          field: STOCK,
          column: 0,
          row: gameState[STOCK][0].length - 1,
        };
        moveToField(from, FOUNDATION);
      }

      for (let i = 0; i < gameState[TABLEAU].length; i++) {
        const stack = gameState[TABLEAU][i];

        if (!stack.length) {
          continue;
        }

        const from = { field: TABLEAU, column: i, row: stack.length - 1 };
        moveToField(from, FOUNDATION);
      }
    } else {
      return handleTriggerAutocomplete(false);
    }
  }, [runAutoMove, gameState, isAutoCompletePossible, moveToField]);

  /* Deselects any card(s). */
  const resetSelectedCard = () => {
    setSelected({ state: [], action: () => {} });
  };

  /* Sets the autocomplete for a run. */
  const handleTriggerAutocomplete = (shouldAutoComplete: boolean) => {
    setRunAutoMove(shouldAutoComplete);
  };

  /* Selects card(s) if none are selected; Moves card(s) if already selected and the rules allow it. */
  const handleSelection = (field: Board, column: number, row: number) => {
    const selectedStack = gameState[field][column];
    if (selected.state.length && field !== STOCK) {
      const topCardOfStack = getCard(
        selectedStack[selectedStack.length - 1]?.id,
      );
      const bottomCardOfSelection = getCard(selected.state[0]?.id);

      if (!isMoveValid(field, bottomCardOfSelection, topCardOfStack)) {
        return setSelection();
      }

      const CardPos = selected.action()!;

      handleMove(createCardMove([CardPos, { field, column, row }]));
      resetSelectedCard();
    } else {
      setSelection();
    }

    function setSelection() {
      const selection = selectedStack[row];
      if (!selection || !selection.isFaceUp) {
        return;
      }

      const action = () => ({ field, column, row });

      const selectedCardStack = selectedStack.slice(row);
      setSelected({ state: selectedCardStack, action });
    }
  };

  /* Sends card(s) to either the tableau or foundation, if possible. */
  const moveSelection = (field: Board, column: number, row: number) => {
    resetSelectedCard();

    const from = { field, column, row };

    if (row !== gameState[field][column].length - 1) {
      moveToField(from, TABLEAU);
      return;
    }

    if (!moveToField(from, FOUNDATION)) {
      moveToField(from, TABLEAU);
      return;
    }
  };

  /* Repeats the last move but backwards, disregarding any rules. */
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

  /* Draws the next card from the stock or else reverses the stock pile to draw from again. */
  const handleDrawCard = () => {
    resetSelectedCard();
    const [leftStack, rightStack] = gameState[STOCK];
    if (!rightStack.length) {
      if (leftStack.length) {
        return handleMove(
          createCardMove([
            {
              field: STOCK,
              column: 0,
              row: 0,
            },
            { field: STOCK, column: 1, row: 0 },
          ]),
        );
      }
      return;
    }

    return handleMove(
      createCardMove([
        {
          field: STOCK,
          column: 1,
          row: rightStack.length - 1,
        },
        { field: STOCK, column: 0, row: leftStack.length },
      ]),
    );
  };

  /* Flips over top cards on the tableau. Uses a short delay for starting a new game. */
  const handleGameStart = () => {
    const flipTopCards = setTimeout(() => {
      setGameState((prevFields) => ({
        ...prevFields,
        [TABLEAU]: prevFields[TABLEAU].map((cardStack) => {
          if (cardStack.length > 0) {
            cardStack[cardStack.length - 1].isFaceUp = true;
          }
          return cardStack;
        }),
      }));
      clearTimeout(flipTopCards);
    }, 250);
  };

  /* Deals a new shuffle of the deck. */
  const handleNewDeal = () => {
    resetSelectedCard();
    setGameState(() => createInitialState(shuffleDeck(ids)));
    handleGameStart();
    setStartTime(null);
  };

  /* Object for easy consumption of custom-tailored functions. */
  const playingField = {
    [STOCK]: {
      cards: gameState[STOCK],
      handleSelection: handleSelection.bind(
        null,
        STOCK,
        0,
        gameState[STOCK][0].length - 1,
      ),
      handleSendToFoundation: moveSelection.bind(
        null,
        STOCK,
        0,
        gameState[STOCK][0].length - 1,
      ),
    },
    [FOUNDATION]: {
      cards: gameState[FOUNDATION],
      handleSelection: handleSelection.bind(null, FOUNDATION),
    },
    [TABLEAU]: {
      cards: gameState[TABLEAU],
      handleSelection: handleSelection.bind(null, TABLEAU),
      handleSendToFoundation: moveSelection.bind(null, TABLEAU),
    },
  };

  return (
    <GameStateContext.Provider
      value={{
        selectedCard: selected,
        getCard,
        handleDrawCard,
        handleNewDeal,
        handleUndo,
        handleTriggerAutocomplete,
        isHistoryEmpty,
        isAutoCompletePossible,
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
