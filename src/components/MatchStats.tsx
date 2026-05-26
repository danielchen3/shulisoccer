import { useCloudData } from "../hooks/useCloudData";
import { fetchMatchStats, type MatchGroup } from "../api";

export function MatchStats() {
  const { data, loading, error } = useCloudData<MatchGroup[]>(fetchMatchStats);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">数据加载失败</div>;

  const matchStatsData = data ?? [];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">比赛统计</h2>
      {matchStatsData.map((group) => (
        <div key={group.year}>
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-blue-800 mr-4">
              {group.year}
              {group.medal || ""}
            </h3>
            {group.video && (
              <a
                href={group.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline hover:text-blue-800 transition ml-5"
              >
                {group.video.label}
              </a>
            )}
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4">
            {group.events.map((event, idx) => (
              <div
                key={event.round + idx}
                className="bg-yellow-50 rounded-lg shadow p-4 flex items-center justify-between text-lg text-gray-800 font-semibold"
              >
                <span className="text-sm text-gray-500 mr-4 min-w-[100px] text-left">
                  {event.round}
                </span>
                {event.video && (
                  <a
                    href={event.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline hover:text-blue-800 transition mr-2"
                  >
                    {event.video.label}
                  </a>
                )}
                <span className="flex-1"></span>
                <span className="flex items-center min-w-[220px]">
                  <span className="text-left w-24">{event.left}</span>
                  <span className="inline-block w-12 text-center">{event.score}</span>
                  <span className="text-right w-24">{event.right}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
