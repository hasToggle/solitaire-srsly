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
      <div className="my-auto">
        <a
          href="https://github.com/hasToggle/solitaire-srsly"
          className="text-gray-400 hover:text-gray-200"
          target="_blank"
          rel="noopener noreferrer"
          title="Code on GitHub"
        >
          <span className="sr-only">GitHub</span>
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-7 w-7"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
}
