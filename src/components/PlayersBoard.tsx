import { Player } from "./player";
import { goalkeeper } from "./playerlist";
import { defender } from "./playerlist";
import { midfield } from "./playerlist";
import { forward } from "./playerlist";

export function PlayersBoard() {
  return (
    <div className="bg-white/80">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">守门员</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {goalkeeper.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">后卫</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {defender.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">中场</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {midfield.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">前锋</h2>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {forward.map((p) => (
          <Player key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}