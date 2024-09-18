"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/dbConnect";
import Winnable from "@/db/models/winnable";
import History from "@/db/models/history";
import Move from "@/db/models/move";

export async function saveCompletedGame(
  gameState: any,
  history: any,
  movesToComplete: number,
) {
  await dbConnect();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const game = new Winnable({
      gameState,
    });

    await game.save({ session });

    const solution = new History({
      winnableId: game._id,
      movesToComplete,
    });

    await solution.save({ session });

    const moves = history.map((transition: any, index: number) => {
      return new Move({
        historyId: solution._id,
        step: index + 1,
        transition,
      });
    });

    const moveSavePromises = moves.map((move: any) => move.save({ session }));
    await Promise.all(moveSavePromises);

    await session.commitTransaction();
    session.endSession();

    console.log("Game saved successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving game:", error);
  }
}
