import { Link, useParams } from "react-router-dom";
import { useCloudData } from "../hooks/useCloudData";
import { fetchNews, type NewsItem } from "../api";
import { getBaseUrl } from "../utils/baseUrl";

export function NewsDetail() {
  const { id } = useParams();
  const base = getBaseUrl();
  const { data, loading, error } = useCloudData<NewsItem[]>(fetchNews);

  if (loading) return <PageMsg>加载中...</PageMsg>;
  if (error) return <PageMsg className="text-red-400">数据加载失败</PageMsg>;

  const item = (data ?? []).find((n) => String(n.id) === id);
  if (!item) return <PageMsg>未找到该新闻</PageMsg>;

  const images = item.image
    ? item.image.split(",").map((s) => {
        const p = s.trim();
        return p.startsWith("http") || p.startsWith("/") ? p : `${base}${p}`;
      })
    : [];

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Link
            to="/"
            className="text-xs text-white/60 hover:text-white uppercase tracking-widest inline-flex items-center gap-2 mb-6"
          >
            ← Back to News
          </Link>
          <span className="block text-brand-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
            ▍ News
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.1] mb-4">
            {item.content}
          </h1>
          <time className="text-white/50 text-sm font-mono">{item.date}</time>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {images.length > 0 && (
          <div className="space-y-6 mb-8">
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt=""
                className="w-full rounded-md object-cover max-h-[480px]"
              />
            ))}
          </div>
        )}

        {item.body ? (
          <div className="prose prose-lg max-w-none text-ink leading-relaxed whitespace-pre-line">
            {item.body}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">暂无详细内容。</p>
        )}
      </section>
    </div>
  );
}

function PageMsg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
      <p className={`text-gray-500 ${className}`}>{children}</p>
    </div>
  );
}
