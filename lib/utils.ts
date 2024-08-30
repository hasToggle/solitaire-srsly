import { suits, ranks } from "@/lib/cards";
import {
  type Card,
  CardState,
  DrawField,
  GoalField,
  MainField,
  AllowedFieldsForMove,
} from "@/lib/types";

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

const isMoveValid = (
  field: AllowedFieldsForMove,
  bottomCard: Card | undefined,
  topCard: Card | undefined,
) => {
  if (!bottomCard) {
    return false;
  }

  if (field === GOAL) {
    // Moving to an empty spot: only an Ace can be moved
    const isBottomCardAce = bottomCard.rank.value === 1;
    if (!topCard) return isBottomCardAce;

    // Moving to a non-empty spot: check suit and rank
    const isSameSuit = bottomCard.suit.display === topCard.suit.display;
    const isRankOneMore = bottomCard.rank.value === topCard.rank.value + 1;

    return isSameSuit && isRankOneMore;
  }

  if (field === MAIN) {
    // Moving to an empty spot: only a King can be moved
    if (!topCard) {
      return bottomCard.rank.value === 13;
    }

    // Moving to a non-empty spot: check rank and color
    const isDifferentColor = bottomCard.suit.color !== topCard.suit.color;
    const isRankOneLess = bottomCard.rank.value === topCard.rank.value - 1;

    return isDifferentColor && isRankOneLess;
  }

  return false;
};

export {
  DRAW,
  GOAL,
  MAIN,
  createDeck,
  shuffleDeck,
  createInitialState,
  isMoveValid,
};
