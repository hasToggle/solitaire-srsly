import {
  type Card,
  CardState,
  DrawField,
  GoalField,
  MainField,
} from "@/lib/types";

const suits = [
  { display: "♠️", color: -1 },
  { display: "♥️", color: 1 },
  { display: "♦️", color: 1 },
  { display: "♣️", color: -1 },
];
const ranks = [
  { display: "A", value: 1 },
  { display: "2", value: 2 },
  { display: "3", value: 3 },
  { display: "4", value: 4 },
  { display: "5", value: 5 },
  { display: "6", value: 6 },
  { display: "7", value: 7 },
  { display: "8", value: 8 },
  { display: "9", value: 9 },
  { display: "10", value: 10 },
  { display: "J", value: 11 },
  { display: "Q", value: 12 },
  { display: "K", value: 13 },
];

const DRAW: DrawField = "draw";
const GOAL: GoalField = "goal";
const MAIN: MainField = "main";

const createDeck = () => {
  const deck = [];
  let id = 1;
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: id++, suit, rank });
    }
  }
  return deck as Card[];
};

const shuffleDeck = (deck: number[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const createInitialState = (deck: number[]) => {
  const gameDeck: CardState[] = deck.map((id) => ({
    id,
    isFaceUp: false,
  }));
  const mainStacks: CardState[][] = [];
  const totalStacks = 7;
  let startIndex = 0;

  for (let i = 1; i <= totalStacks; i++) {
    mainStacks.push(gameDeck.slice(startIndex, startIndex + i));
    startIndex += i;
  }

  return {
    [DRAW]: [[], gameDeck.slice(startIndex)],
    [GOAL]: Array.from({ length: 4 }, () => []),
    [MAIN]: mainStacks,
  };
};

export {
  suits,
  ranks,
  DRAW,
  GOAL,
  MAIN,
  createDeck,
  shuffleDeck,
  createInitialState,
};
