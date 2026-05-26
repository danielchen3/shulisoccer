import { useCloudData } from "../hooks/useCloudData";
import { fetchNews, type NewsItem } from "../api";

export function NewsBoard() {
  const { data, loading, error } = useCloudData<NewsItem[]>(fetchNews);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">数据加载失败</div>;

  const newsList = data ?? [];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">球队公告</h2>
      <ul className="space-y-2">
        {newsList.map((item, idx) => (
          <li key={idx} className="p-4 rounded shadow bg-white/60 text-gray-900 flex flex-col items-start">
            <div className="flex items-center">
              <span className="font-mono text-sm text-gray-500 mr-4 min-w-[100px]">{item.date}</span>
              <span>{item.content}</span>
            </div>
            {item.image && (
              <img
                src={item.image}
                alt="news"
                className="mt-4 w-64 max-w-full rounded shadow"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
