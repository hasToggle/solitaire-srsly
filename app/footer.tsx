"use client";

import { useGameState } from "./game-state-context";
import Gametime from "./game-time";
import Button from "@/components/button";

export default function Footer() {
  const {
    handleNewDeal,
    handleUndo,
    handleTriggerAutocomplete,
    isHistoryEmpty,
    isAutoCompletePossible,
  } = useGameState();
  return (
    <footer className="absolute bottom-0 flex w-full justify-between gap-x-4 bg-black/30 p-4">
      <Button
        className="hover:bg-sky-50 hover:text-sky-950"
        onClick={handleNewDeal}
      >
        New Deal 🆕
      </Button>
      <div className="flex items-center gap-4">
        <Gametime />
        <Button
          className="group enabled:hover:bg-sky-50 enabled:hover:text-sky-950 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
          onClick={handleUndo}
          disabled={isHistoryEmpty}
        >
          Undo{" "}
          <span
            className={`${!isHistoryEmpty && "invert"} group-hover:invert-0`}
          >
            🔙
          </span>
        </Button>
        <Button
          className="enabled:bg-sky-50 enabled:text-sky-950 enabled:hover:border-sky-500 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
          onClick={() => handleTriggerAutocomplete(true)}
          disabled={!isAutoCompletePossible}
        >
          Auto ⚡️
        </Button>
      </div>
      <div></div>
    </footer>
  );
}
