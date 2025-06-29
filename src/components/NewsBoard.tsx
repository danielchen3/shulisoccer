import { newsList } from "./data/newslist";

export function NewsBoard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">球队公告</h2>
      <ul className="space-y-2">
        {[...newsList].reverse().map((item, idx) => (
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
