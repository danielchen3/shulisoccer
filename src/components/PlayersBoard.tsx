import { Player } from "./player";
import { players } from "./playerlist";
import { retiredPlayers } from "./playerlist";

export function PlayersBoard() {
  return (
    <div className="bg-white/80">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">现役球员</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {players.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">退役球员</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {retiredPlayers.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}