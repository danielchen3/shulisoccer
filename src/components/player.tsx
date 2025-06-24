import React from "react";

interface PlayerProps {
  filename: string;
  name: string;
  position: string;
  number: number;
  grade: number;
}

export const Player: React.FC<PlayerProps> = ({ filename, name, position, number, grade }) => {
  // support jpg, png
  const [imgExt, setImgExt] = React.useState<'jpg' | 'png'>('jpg');
  const imageSrc = `/src/assets/player/${filename}.${imgExt}`;
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgExt === 'jpg') {
      setImgExt('png');
    } else {
      e.currentTarget.src = "/src/assets/cat.jpg"; // fallback
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center w-64">
      <img
        src={imageSrc}
        alt={name}
        onError={handleImgError}
        className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-gray-300 hover:scale-120 transition-transform"
      />
      <div className="text-gray-600 text-lg font-bold mb-1">{name}</div>
      <div className="text-gray-600 mb-1">Position: {position}</div>
      <div className="text-gray-600 mb-1">Number: {number}</div>
      {grade && <div className="text-gray-600">Grade: {grade}</div>}
    </div>
  );
};