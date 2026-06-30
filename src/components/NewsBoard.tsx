import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useCloudData } from "../hooks/useCloudData";
import { fetchNews, type NewsItem } from "../api";
import { getBaseUrl } from "../utils/baseUrl";
import { TeamIntro } from "./TeamIntro";

const HERO_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8];
const AUTO_INTERVAL = 5000;

export function NewsBoard() {
  const base = getBaseUrl();
  const { data, loading, error } = useCloudData<NewsItem[]>(fetchNews);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = HERO_IMAGES.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((i) => (i + 1) % total), AUTO_INTERVAL);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const go = (dir: -1 | 1) => {
    setCurrent((i) => (i + dir + total) % total);
    resetTimer();
  };

  const newsList = data ?? [];
  const featured = newsList[0];
  const latestNewsPath = featured ? `/news/${featured.id}` : "/";
  return (
    <div>
      {/* ----- HERO ----- */}
      <section className="relative bg-ink text-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-5">
          {/* 左：暗色文字面板 */}
          <div className="lg:col-span-2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <span className="inline-block text-brand-400 text-xs font-bold uppercase tracking-[0.3em] mb-6">
              ▍ Shuli College Football
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] uppercase mb-6">
              SHULI FC
              <span className="mt-3 block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                树礼书院足球队
              </span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base mb-8 max-w-md">
              {featured?.date ?? ""} · 关注最新球队动态、比赛结果与球员故事。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={latestNewsPath}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink font-bold uppercase tracking-wider text-sm px-6 py-3 transition-colors"
              >
                Latest News
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                to="/players"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white hover:text-ink font-bold uppercase tracking-wider text-sm px-6 py-3 transition-colors"
              >
                Squad
              </Link>
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white hover:text-ink font-bold uppercase tracking-wider text-sm px-6 py-3 transition-colors"
              >
                Matches
              </Link>
            </div>
          </div>

          {/* 右：轮播大图 */}
          <div className="lg:col-span-3 relative min-h-[260px] lg:min-h-[480px] overflow-hidden">
            {HERO_IMAGES.map((n, idx) => (
              <img
                key={n}
                src={`${base}assets/photo/full/${n}.jpg`}
                alt={`Team photo ${n}`}
                className={[
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                  idx === current ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/10 to-transparent lg:from-ink lg:via-ink/30 lg:to-transparent pointer-events-none" />

            {/* 左右按钮 */}
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            {/* 底部指示点 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrent(idx); resetTimer(); }}
                  className={[
                    "w-2 h-2 rounded-full transition-all",
                    idx === current ? "bg-brand-500 w-6" : "bg-white/50 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <TeamIntro />

      {/* ----- LATEST NEWS GRID ----- */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">
              ▍ Latest
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase">
              News &amp; Notices
            </h2>
          </div>
        </div>

        {loading && <div className="text-gray-500 py-12">加载中...</div>}
        {error && <div className="text-red-500 py-12">数据加载失败</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item, idx) => (
            <NewsCard key={idx} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function resolveImg(raw: string, base: string) {
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `${base}${raw}`;
}

function NewsCard({ item }: { item: NewsItem }) {
  const base = getBaseUrl();
  const firstImg = item.image?.split(",")[0]?.trim();
  const cover = firstImg ? resolveImg(firstImg, base) : `${base}assets/photo/full/2.jpg`;

  return (
    <Link to={`/news/${item.id}`} className="block">
      <article className="group bg-white border border-black/5 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 bg-brand-500 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            News
          </span>
        </div>
        <div className="p-5">
          <time className="block text-xs text-gray-500 font-mono mb-2">{item.date}</time>
          <p className="text-ink font-semibold leading-snug">{item.content}</p>
        </div>
      </article>
    </Link>
  );
}
