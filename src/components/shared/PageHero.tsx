interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-ink text-white py-12 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <span className="block text-brand-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
          ▍ {eyebrow}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase">
          {title}
        </h1>
        {subtitle && <p className="text-white/60 mt-3 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}
