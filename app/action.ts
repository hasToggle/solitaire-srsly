"use server";

import dbConnect from "@/db/dbConnect";
import Winnable from "@/db/models/winnable";

export async function saveCompletedGame(gameState: any, history: any) {
  await dbConnect();

  const game = new Winnable({
    gameState,
    history,
  });

  try {
    await game.save();
    console.log("Game saved successfully");
  } catch (error) {
    console.error("Error saving game:", error);
  }
}
