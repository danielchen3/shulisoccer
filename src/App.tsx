import { Sidebar } from './components/Sidebar'
import { PlayersBoard } from './components/PlayersBoard'
import { RetiredPlayersBoard } from './components/RetiredPlayersBoard'
import { Forum } from './components/Forum'
import { MatchStats } from './components/MatchStats'
import { TopScorers } from './components/TopScorers'
import { NewsBoard } from './components/NewsBoard'
import { PlayerDetail } from './components/PlayerDetail'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen bg-gradient-to-br from-blue-200 via-blue-50 to-indigo-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col items-stretch justify-center p-0 sm:p-0">
          <div className="flex-1 min-h-0 flex flex-col justify-center items-center px-4 py-8 sm:px-8 overflow-y-auto w-full">
            <div className="w-full bg-white/80 rounded-2xl shadow-2xl p-8 sm:p-12 backdrop-blur-md overflow-y-auto scrollbar-thin">
              <Routes>
                <Route path="/shulisoccer" element={<NewsBoard />} />
                <Route path="/" element={<NewsBoard />} />
                <Route path="/players" element={<PlayersBoard />} />
                <Route path="/retired_players" element={<RetiredPlayersBoard />} />
                <Route path="/scorers" element={<TopScorers />} />
                <Route path="/matches" element={<MatchStats />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/player/:filename" element={<PlayerDetail />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  )
}
