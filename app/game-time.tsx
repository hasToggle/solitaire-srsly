import { format } from "date-fns";
import { useGameState } from "./game-state-context";

export default function Gametime() {
  const { elapsedTime } = useGameState();
  return (
    <div className="w-32 text-white/80">
      Your time: {format(new Date(elapsedTime), "mm:ss")}
    </div>
  );
}
