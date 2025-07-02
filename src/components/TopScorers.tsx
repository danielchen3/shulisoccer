import { topScorers } from "./data/topScorerData";

const medal = ["🥇", "🥈", "🥉"];

export function TopScorers() {
  const sorted = [...topScorers].sort((a, b) => b.goals - a.goals);

  let lastGoals = null;
  let lastRank = 0;
  let realRank = 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">射手榜</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/80 rounded-lg shadow text-black">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-3 px-4 text-left">排名</th>
              <th className="py-3 px-4 text-left">球员</th>
              <th className="py-3 px-4 text-right">进球</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((scorer, idx) => {
              realRank++;
              if (scorer.goals !== lastGoals) {
                lastRank = realRank;
                lastGoals = scorer.goals;
              }
              return (
                <tr
                  key={scorer.name}
                  className={`border-b last:border-0 ${
                    lastRank <= 3 ? "bg-yellow-50 font-bold" : ""
                  } text-black`}
                >
                  <td className="py-2 px-4">
                    {lastRank <= 3 ? medal[lastRank - 1] : lastRank}
                  </td>
                  <td className="py-2 px-4">{scorer.name}</td>
                  <td className="py-2 px-4 text-right">{scorer.goals}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}