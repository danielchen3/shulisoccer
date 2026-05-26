import { PlayerImage } from "./shared/PlayerImage";

interface PlayerCardProps {
  filename: string;
  name: string;
  position: string;
  age?: number;
  height?: number;
  weight?: number;
  foot?: string;
}

export const PlayerCard = ({
  filename, name, position, age, height, weight, foot
}: PlayerCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center w-72 transition-transform hover:scale-105 hover:shadow-2xl">
      <div className="relative mb-4">
        <PlayerImage
          filename={filename}
          alt={name}
          folder="retired"
          className="w-36 h-36 object-cover rounded-full border-4 border-yellow-200 shadow"
        />
      </div>
      <div className="text-gray-900 text-xl font-extrabold mb-2 tracking-wide">{name}</div>
      <ul className="text-gray-700 text-base space-y-1 text-center">
        <li>
          <span className="font-semibold text-yellow-700">位置：</span>
          {position}
        </li>
        {age !== undefined && (
          <li>
            <span className="font-semibold text-yellow-700">年龄：</span>
            {age}
          </li>
        )}
        {height !== undefined && (
          <li>
            <span className="font-semibold text-yellow-700">身高：</span>
            {height} cm
          </li>
        )}
        {weight !== undefined && (
          <li>
            <span className="font-semibold text-yellow-700">体重：</span>
            {weight} kg
          </li>
        )}
        {foot && (
          <li>
            <span className="font-semibold text-yellow-700">惯用脚：</span>
            {foot}
          </li>
        )}
      </ul>
    </div>
  );
};
