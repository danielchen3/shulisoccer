import React from "react";

interface PlayerProps {
  filename: string;
  name: string;
  position: string;
  age?: number;
  height?: number;
  weight?: number;
  foot?: string;
}

export const Player: React.FC<PlayerProps> = ({
  filename, name, position, age, height, weight, foot
}) => {
  const [imgExt, setImgExt] = React.useState<'jpg' | 'png'>('jpg');
  const base = import.meta.env.BASE_URL || '/';
  const imageSrc = `${base}assets/retired/${filename}.${imgExt}`;
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgExt === 'jpg') {
      setImgExt('png');
    } else {
      e.currentTarget.src = `${base}assets/cat.jpg`;
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center w-72 transition-transform hover:scale-105 hover:shadow-2xl">
      <div className="relative mb-4">
        <img
          src={imageSrc}
          alt={name}
          onError={handleImgError}
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