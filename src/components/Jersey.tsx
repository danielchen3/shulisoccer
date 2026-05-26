import { PageHero } from "./shared/PageHero";
import { getBaseUrl } from "../utils/baseUrl";

export function Jersey() {
  const base = getBaseUrl();
  const jerseys = [
    { file: "主场.jpg",         label: "Home",         zh: "主场球衣" },
    { file: "客场.jpg",         label: "Away",         zh: "客场球衣" },
    { file: "守门员主场.jpg",   label: "GK Home",      zh: "守门员主场" },
    { file: "守门员客场.jpg",   label: "GK Away",      zh: "守门员客场" },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Identity"
        title="Kits"
        subtitle="2025/26 赛季官方球衣展示。"
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {jerseys.map((j, idx) => (
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
                <div className="font-display text-xl uppercase">{j.label}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {j.zh}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
