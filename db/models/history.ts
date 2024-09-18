import mongoose, { Schema } from "mongoose";

const HistorySchema = new Schema(
  {
    winnableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "winnable",
      required: true,
    },
    movesToComplete: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const History =
  mongoose.models.history || mongoose.model("history", HistorySchema);

export default History;
