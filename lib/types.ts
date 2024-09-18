export type Card = {
  id: number;
  suit: { display: "♠️" | "♥️" | "♦️" | "♣️"; color: -1 | 1 };
  rank: {
    display:
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7"
      | "8"
      | "9"
      | "10"
      | "J"
      | "Q"
      | "K"
      | "A";
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  };
};

export type CardState = {
  id: Card["id"];
  isFaceUp: boolean;
};

export type Stock = "stock";

export type Foundation = "foundation";

export type Tableau = "tableau";

export type Board = Stock | Foundation | Tableau;

export type AllowedFieldsForMove = Foundation | Tableau;

export type GameState = {
  [key in Board]: CardState[][];
};

export type CardActionState = {
  state: CardState[];
  action: () => CardPosition | void;
};

export type CardPosition = {
  field: Board;
  column: number;
  row: number;
};

export type Transition = {
  pos: CardPosition;
  effect: (card: CardState[]) => CardState[];
  transform: (stack: CardState[]) => CardState[];
};

export type CardMove = {
  from: Transition;
  to: Transition;
};

export type GameStateContext = {
  stock: {
    cards: CardState[][];
    handleSelection: () => void;
    handleSendToFoundation: () => void;
  };
  foundation: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
  };
  tableau: {
    cards: CardState[][];
    handleSelection: (column: number, row: number) => void;
    handleSendToFoundation: (column: number, row: number) => void;
  };
  selectedCard: CardActionState;
  getCard: (id: number | undefined) => Card | undefined;
  handleDrawCard: () => void;
  handleNewDeal: () => void;
  handleUndo: () => void;
  handleTriggerAutocomplete: (shouldAutoComplete: boolean) => void;
  testing_handleSaveCompletedGame: () => void;
  isHistoryEmpty: boolean;
  isAutoCompletePossible: boolean;
  elapsedTime: number;
};
