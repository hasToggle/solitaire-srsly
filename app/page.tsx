"use client";

import { useGameState } from "./game-state-context";
import EmptySlot from "@/components/empty-slot";
import Stack from "@/components/stack";
import Card from "@/components/card";
import Gametime from "@/components/game-time";

export default function Home() {
  const {
    tableau: {
      cards: tableauCards,
      handleSelection: handleMainSelection,
      handleSendToFoundation: handleMainSendToFoundation,
    },
    stock: {
      cards: [leftStack, rightStack],
      handleSelection: handleDrawSelection,
      handleSendToFoundation: handleDrawSendToFoundation,
    },
    foundation: {
      cards: foundationCards,
      handleSelection: handleFoundationSelection,
    },
    handleDrawCard,
    handleGameReset,
    handleUndo,
    handleTriggerAutocomplete,
    isHistoryEmpty,
    isAutoCompletePossible,
    elapsedTime,
  } = useGameState();

  return (
    <div className="relative min-h-screen">
      <main>
        <div className="grid grid-cols-12 gap-14 p-24">
          <div className="col-span-5 col-start-2 grid grid-cols-4 gap-16">
            {foundationCards.map((cardStack, cardIndex) => (
              <Card
                key={cardIndex}
                className={"text-4xl"}
                card={cardStack[cardStack.length - 1]}
                onClick={() =>
                  handleFoundationSelection(
                    cardIndex,
                    Math.max(0, cardStack.length - 1),
                  )
                }
              />
            ))}
          </div>

          <div className="col-span-6 col-start-7 flex items-start justify-center gap-7">
            <div className="mt-5">
              {leftStack.length ? (
                <Card
                  className={"text-4xl"}
                  card={leftStack[leftStack.length - 1]}
                  onClick={() => handleDrawSelection()}
                  onDoubleClick={handleDrawSendToFoundation}
                />
              ) : (
                <EmptySlot />
              )}
            </div>
            <div className="relative">
              <Card card={rightStack[0]} onClick={handleDrawCard} />
              <span className="absolute bottom-1 left-1 w-9 rounded-md border border-sky-300 bg-sky-600 px-2 py-1 text-center text-sky-50">
                {rightStack.length}
              </span>
            </div>
          </div>

          <div className="col-span-6 col-start-2 grid grid-cols-7 gap-40">
            {tableauCards.map((cardStack, stackIndex) => (
              <Stack key={stackIndex}>
                {cardStack.length === 0 && (
                  <EmptySlot
                    onClick={() => handleMainSelection(stackIndex, 0)}
                  />
                )}
                {cardStack.map((card, cardIndex) => (
                  <Card
                    key={cardIndex}
                    card={card}
                    className={"items-baseline text-2xl"}
                    onClick={() => handleMainSelection(stackIndex, cardIndex)}
                    onDoubleClick={() =>
                      handleMainSendToFoundation(stackIndex, cardIndex)
                    }
                  />
                ))}
              </Stack>
            ))}
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 flex w-full justify-between gap-x-4 bg-black/30 p-4">
        <button
          className="rounded-md border border-sky-700/80 bg-gray-800/70 px-8 py-1.5 text-white/80 transition ease-in-out hover:bg-sky-50 hover:text-sky-950"
          onClick={handleGameReset}
        >
          New Deal 🆕
        </button>
        <div className="flex items-center gap-4">
          <Gametime elapsedTime={elapsedTime} />
          <button
            className="group rounded-md border border-sky-700/80 bg-gray-800/70 px-8 py-1.5 text-white/80 transition ease-in-out enabled:hover:bg-sky-50 enabled:hover:text-sky-950 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
            onClick={handleUndo}
            disabled={isHistoryEmpty}
          >
            Undo{" "}
            <span
              className={`${!isHistoryEmpty && "invert"} group-hover:invert-0`}
            >
              🔙
            </span>
          </button>
          <button
            className="rounded-md border border-sky-700/80 bg-gray-800/70 px-8 py-1.5 text-white/80 transition ease-in-out enabled:bg-sky-50 enabled:text-sky-950 enabled:hover:border-sky-500 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
            onClick={() => handleTriggerAutocomplete(true)}
            disabled={!isAutoCompletePossible}
          >
            Auto ⚡️
          </button>
        </div>
        <div></div>
      </footer>
    </div>
  );
}
