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

export type DrawField = "draw";

export type GoalField = "goal";

export type MainField = "main";

export type PlayingField = DrawField | GoalField | MainField;

export type AllowedFieldsForMove = GoalField | MainField;

export type GameState = {
  [key in PlayingField]: CardState[][];
};

export type CardActionState = {
  state: CardState[];
  action: () => CardPosition | void;
};

export type CardPosition = {
  field: PlayingField;
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
