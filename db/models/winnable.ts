import mongoose, { Schema } from "mongoose";

const InitialGameStateSchema = new Schema(
  {
    stock: { type: [[Number]], required: true },
    tableau: { type: [[Number]], required: true },
  },
  { _id: false },
);

const HistorySchema = new Schema(
  {
    from: {
      pos: {
        field: { type: String, required: true },
        column: { type: Number, required: true },
        row: { type: Number, required: true },
      },
    },
    to: {
      pos: {
        field: { type: String, required: true },
        column: { type: Number, required: true },
        row: { type: Number, required: true },
      },
    },
  },
  { _id: false },
);

const GameSchema = new Schema(
  {
    gameState: { type: InitialGameStateSchema, required: true },
    history: {
      type: [HistorySchema],
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const Winnable =
  mongoose.models.winnable || mongoose.model("winnable", GameSchema);

export default Winnable;
