import { PageHero } from "./shared/PageHero";
import { getBaseUrl } from "../utils/baseUrl";

interface JerseyItem {
  file: string;
  label: string;
  zh: string;
}

const SEASONS: { title: string; subtitle: string; jerseys: JerseyItem[] }[] = [
  {
    title: "2025/26 Season",
    subtitle: "25-26 赛季球衣",
    jerseys: [
      { file: "25-26-jersey.jpg", label: "Kit", zh: "球员球衣" },
      { file: "25-26守门员.jpg", label: "GK Kit", zh: "守门员球衣" },
    ],
  },
  {
    title: "2024/25 Season",
    subtitle: "24-25 赛季球衣",
    jerseys: [
      { file: "主场.jpg", label: "Home", zh: "主场球衣" },
      { file: "客场.jpg", label: "Away", zh: "客场球衣" },
      { file: "守门员主场.jpg", label: "GK Home", zh: "守门员主场" },
      { file: "守门员客场.jpg", label: "GK Away", zh: "守门员客场" },
    ],
  },
  {
    title: "2023/24 Season",
    subtitle: "23-24 赛季球衣",
    jerseys: [
      { file: "23-24-jersey.jpg", label: "Kit", zh: "球员球衣" },
    ],
  },
];

export function Jersey() {
  const base = getBaseUrl();

  return (
    <div>
      <PageHero
        eyebrow="Identity"
        title="Kits"
        subtitle="历赛季官方球衣展示。"
      />
      {SEASONS.map((season) => (
        <section
          key={season.title}
          className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14"
        >
          <div className="flex items-baseline gap-4 mb-6 border-b border-black/10 pb-3">
            <h2 className="font-display text-2xl sm:text-3xl uppercase">
              {season.title}
            </h2>
            <span className="text-sm text-gray-500">{season.subtitle}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {season.jerseys.map((j, idx) => (
              <article
                key={j.file}
                className="group relative bg-gradient-to-b from-paper-2 to-white border border-black/5 overflow-hidden"
              >
                <span
                  className="absolute top-2 left-3 font-display text-6xl lg:text-8xl text-ink/5 pointer-events-none select-none"
                  aria-hidden
                >
                  0{idx + 1}
                </span>
                <div className="relative aspect-[3/4] flex items-center justify-center p-4">
                  <img
                    src={`${base}assets/Jersey/${j.file}`}
                    alt={j.label}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-black/5">
                  <div className="font-display text-xl uppercase">
                    {j.label}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {j.zh}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
