"use server";

import dbConnect from "@/db/dbConnect";
import Winnable from "@/db/models/winnable";

export async function saveCompletedGame(gameState: any, history: any) {
  console.log("Entering");
  await dbConnect();
  const game = new Winnable({
    gameState,
    history,
  });

  try {
    console.log("Saving game...");
    await game.save();
    console.log("Game saved successfully");
  } catch (error) {
    console.error("Error saving game:", error);
  }
}
