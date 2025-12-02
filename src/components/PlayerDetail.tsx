import { useParams } from "react-router-dom";
import { goalkeeper, defender, midfield, forward } from "./data/playerlist";
import { PlayerImage } from "./shared/PlayerImage";

const allPlayers = [...goalkeeper, ...defender, ...midfield, ...forward];

export function PlayerDetail() {
  const { filename } = useParams();
  const player = allPlayers.find(p => p.filename === filename);

  if (!player) return <div className="p-8">未找到该球员</div>;

  return (
    <div className="bg-gray-50 p-8 rounded-lg flex flex-row items-center justify-between max-w-4xl mx-auto mt-8">
      <div>
        <div className="flex items-center mb-2">
          <span className="text-3xl font-bold mr-3 text-gray-900">{player.name}</span>
          <span className="text-2xl mr-2 text-gray-900">{player.nationalityFlag}</span>
        </div>
        <div className="text-gray-400 text-xl mb-4">{player.enName ?? ""}</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-lg text-gray-700">
          <div>俱乐部：{player.club ?? "--"}</div>
          <div>位置：{player.position}</div>
          <div>号码：{player.number}号</div>
          <div>省份：{player.province ?? "--"}</div>
          <div>年龄：{player.age ?? "--"}岁</div>
          <div>生日：{player.birthday ?? "--"}</div>
          <div>身高：{player.height ?? "--"}cm</div>
          <div>体重：{player.weight ?? "--"}kg</div>
          <div>惯用脚：{player.foot ?? "--"}</div>
        </div>
      </div>
      <PlayerImage
        filename={player.filename}
        alt={player.name}
        className="w-48 h-48 object-cover rounded-lg ml-8"
        fallback="sydney.png"
      />
    </div>
  );
}