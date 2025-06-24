import React from "react";
import { goalkeeper, defender, midfield, forward } from "./data/playerlist";
import { useNavigate } from "react-router-dom";

const positionMap = [
  { label: "守门员", data: goalkeeper },
  { label: "后卫", data: defender },
  { label: "中场", data: midfield },
  { label: "前锋", data: forward },
];

export function PlayersBoard() {
  const base = import.meta.env.BASE_URL || '/';
  const navigate = useNavigate();

  function PlayerImg({ filename }: { filename: string }) {
    const [imgExt, setImgExt] = React.useState<'jpg' | 'png'>('jpg');
    const imageSrc = `${base}assets/player/${filename}.${imgExt}`;
    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (imgExt === 'jpg') {
        setImgExt('png');
      } else {
        e.currentTarget.src = `${base}assets/cat.jpg`;
      }
    };
    return (
      <img
        src={imageSrc}
        alt={filename}
        className="w-8 h-8 rounded-full mx-auto"
        onError={handleImgError}
      />
    );
  }

  return (
    <div className="bg-white/80 p-4 rounded-lg">
      {positionMap.map(({ label, data }) => (
        <div key={label} className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">{label}</h2>
          <hr className="mb-6 border-gray-300" />
          <div className="overflow-x-auto">
            <table className="min-w-full text-center border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-500 text-base">
                  <th className="px-2 py-1">位置</th>
                  <th className="px-2 py-1">号码</th>
                  <th className="px-2 py-1">头像</th>
                  <th className="px-2 py-1">姓名</th>
                  <th className="px-2 py-1">首发</th>
                  <th className="px-2 py-1">替补</th>
                  <th className="px-2 py-1">进球</th>
                  <th className="px-2 py-1">省份</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr
                    key={p.name}
                    className="bg-gray-50 hover:bg-yellow-50 cursor-pointer"
                    onClick={() => navigate(`/player/${p.filename}`)}
                  >
                    <td className="px-2 py-1 text-gray-900">{p.position}</td>
                    <td className="px-2 py-1 text-gray-900">{p.number}</td>
                    <td className="px-2 py-1">
                      <PlayerImg filename={p.filename} />
                    </td>
                    <td className="px-2 py-1 text-gray-900">{p.name}</td>
                    <td className="px-2 py-1 text-gray-900">{p.starts ?? "--"}</td>
                    <td className="px-2 py-1 text-gray-900">{p.subs ?? "--"}</td>
                    <td className="px-2 py-1 text-gray-900">{p.goals ?? "--"}</td>
                    <td className="px-2 py-1 text-gray-900">{p.province ?? "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}