export type Card = {
  suit: "♠️" | "♥️" | "♦️" | "♣️";
  rank:
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
  faceUp: boolean;
};
