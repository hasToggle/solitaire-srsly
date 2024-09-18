import mongoose, { Schema } from "mongoose";

const MoveSchema = new Schema(
  {
    historyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "history",
      required: true,
    },
    transition: {
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
    step: { type: Number, required: true },
  },
  { versionKey: false },
);

const Move = mongoose.models.move || mongoose.model("move", MoveSchema);

export default Move;
