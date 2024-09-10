"use client";

import { useGameState } from "./game-state-context";
import EmptySlot from "@/components/empty-slot";
import Stack from "@/components/stack";
import Card from "@/components/card";
import Gametime from "@/components/game-time";

export default function Home() {
  const {
    main: {
      cards: mainCards,
      handleSelection: handleMainSelection,
      handleSendToGoal: handleMainSendToGoal,
    },
    draw: {
      cards: [leftStack, rightStack],
      handleSelection: handleDrawSelection,
      handleSendToGoal: handleDrawSendToGoal,
    },
    goal: { cards: goalCards, handleSelection: handleGoalSelection },
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
            {goalCards.map((cardStack, cardIndex) => (
              <Card
                key={cardIndex}
                className={"text-4xl"}
                card={cardStack[cardStack.length - 1]}
                onClick={() =>
                  handleGoalSelection(
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
                  onDoubleClick={handleDrawSendToGoal}
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
            {mainCards.map((cardStack, stackIndex) => (
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
                      handleMainSendToGoal(stackIndex, cardIndex)
                    }
                  />
                ))}
              </Stack>
            ))}
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 flex w-full justify-between gap-x-4 bg-black/10 p-4">
        <button
          className="bg-table/30 rounded-md border border-sky-300/50 px-8 py-1.5 text-white/80 transition ease-in-out hover:bg-white hover:text-sky-950"
          onClick={handleGameReset}
        >
          New Deal 🆕
        </button>
        <div className="flex items-center gap-4">
          <Gametime elapsedTime={elapsedTime} />
          <button
            className="bg-table/30 rounded-md border border-sky-300/50 px-8 py-1.5 text-white/80 transition ease-in-out enabled:hover:bg-white enabled:hover:text-sky-950 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
            onClick={handleUndo}
            disabled={isHistoryEmpty}
          >
            Undo 🔙
          </button>
          <button
            className="bg-table/30 rounded-md border border-sky-300/50 px-8 py-1.5 text-white/80 transition ease-in-out enabled:bg-white enabled:text-sky-950 enabled:hover:border-sky-500 disabled:cursor-not-allowed disabled:border-sky-300/30 disabled:text-white/70"
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
