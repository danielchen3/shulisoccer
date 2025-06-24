import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { PlayersBoard } from './components/PlayersBoard'
import { Forum } from './components/Forum'
import { MatchStats } from './components/MatchStats'
import { TopScorers } from './components/TopScorers'
import { NewsBoard } from './components/NewsBoard'

export default function App() {
  const [page, setPage] = useState('news')

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-200 via-blue-50 to-indigo-200">
      <Sidebar page={page} setPage={setPage} />

      <main className="flex-1 overflow-y-auto flex flex-col items-stretch justify-center p-0 sm:p-0">
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center px-4 py-8 sm:px-8 overflow-y-auto w-full">
          <div className="w-full bg-white/80 rounded-2xl shadow-2xl p-8 sm:p-12 backdrop-blur-md overflow-y-auto scrollbar-thin">
            {page === 'news' && <NewsBoard />}
            {page === 'players' && <PlayersBoard />}
            {page === 'scorers' && <TopScorers />}
            {page === 'matches' && <MatchStats />}
            {page === 'forum' && <Forum />}
          </div>
        </div>
      </main>
    </div>
  )
}
