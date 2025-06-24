import { Player } from "./player";
import { Retired } from "./playerlist";


export function RetiredPlayersBoard() {
  return (
    <div className="bg-white/80">
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {Retired.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}