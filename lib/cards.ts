import { type Card } from "@/lib/types";

const suits = ["♠️", "♥️", "♦️", "♣️"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const createDeck = () => {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck as Card[];
};

const shuffleDeck = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const createStacks = (deck: Card[]): Card[][] => {
  const stacks: Card[][] = [];
  const totalStacks = 7;
  let startIndex = 0;

  for (let i = 1; i <= totalStacks; i++) {
    stacks.push(
      deck
        .slice(startIndex, startIndex + i)
        .map((card, index, args) =>
          index === args.length - 1 ? { ...card, faceUp: true } : card
        )
    );
    startIndex += i;
  }

  return stacks;
};

export { suits, ranks, createDeck, shuffleDeck, createStacks };
