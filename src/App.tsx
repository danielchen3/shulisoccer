import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { PlayersBoard } from "./components/PlayersBoard";
import { RetiredPlayersBoard } from "./components/RetiredPlayersBoard";
import { MatchStats } from "./components/MatchStats";
import { TopScorers } from "./components/TopScorers";
import { NewsBoard } from "./components/NewsBoard";
import { PlayerDetail } from "./components/PlayerDetail";
import { Jersey } from "./components/Jersey";
import { TeamMoments } from "./components/TeamMoments";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-paper-2 text-ink flex flex-col">
        <NavBar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<NewsBoard />} />
            <Route path="/players" element={<PlayersBoard />} />
            <Route path="/retired_players" element={<RetiredPlayersBoard />} />
            <Route path="/scorers" element={<TopScorers />} />
            <Route path="/matches" element={<MatchStats />} />
            <Route path="/player/:filename" element={<PlayerDetail />} />
            <Route path="/jersey" element={<Jersey />} />
            <Route path="/moments" element={<TeamMoments />} />
          </Routes>
        </main>
        <footer className="bg-ink text-white/60 py-8 mt-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-lg tracking-widest text-white">
                SHULI FC
              </span>
              <span className="text-xs uppercase tracking-[0.2em]">
                南方科技大学 · 树礼书院
              </span>
            </div>
            <div className="text-xs uppercase tracking-widest">
              © 2025 Shuli Soccer · All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
