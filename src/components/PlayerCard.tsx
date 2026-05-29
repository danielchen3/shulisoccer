import { PlayerImage } from "./shared/PlayerImage";

interface PlayerCardProps {
  name: string;
  position: string;
  age?: number;
  height?: number;
  weight?: number;
  foot?: string;
}

export function PlayerCard({
  name, position, age, height, weight, foot,
}: PlayerCardProps) {
  return (
    <article className="group bg-white border border-black/5 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brand-100 to-brand-300">
        <PlayerImage
          name={name}
          variant={2}
          alt={name}
          folder="retired"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        <span className="absolute top-3 left-3 bg-brand-500 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-1">
          Legend
        </span>
      </div>

      <div className="p-4">
        <div className="font-display text-xl uppercase">{name}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          {position}
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-700">
          {age !== undefined && <Row label="年龄" value={`${age}`} />}
          {height !== undefined && <Row label="身高" value={`${height} cm`} />}
          {weight !== undefined && <Row label="体重" value={`${weight} kg`} />}
          {foot && <Row label="惯用脚" value={foot} />}
        </dl>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-gray-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-ink font-semibold text-right">{value}</dd>
    </>
  );
}
