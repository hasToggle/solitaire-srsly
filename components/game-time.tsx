import { format } from "date-fns";

export default function Gametime({ elapsedTime }: { elapsedTime: number }) {
  return (
    <div className="w-32 text-white/80">
      Your time: {format(new Date(elapsedTime), "mm:ss")}
    </div>
  );
}
