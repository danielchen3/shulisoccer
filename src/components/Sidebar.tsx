import React from "react";

type SidebarProps = {
  setPage: (p: string) => void
  page: string
}

export function Sidebar({ setPage, page }: SidebarProps) {
  const base = import.meta.env.BASE_URL || '/';

  const items = [
    { label: '🏠 News', key: 'news' },
    { label: '👥 Players', key: 'players' },
    { label: '🎖️ Retired Players', key: 'retired_players' },
    { label: '🥅 Top Scorers', key: 'scorers' },
    { label: '📊 Match Stats', key: 'matches' },
    { label: '💬 Forum', key: 'forum' },
  ]

  return (
    <aside className="w-[220px] max-w-[25%] min-w-[180px] bg-white text-black flex flex-col">
      <div className="p-6 border-b border-blue-100 text-center">
        <img
          src={`${base}assets/logo.jpg`}
          alt="Shuli Soccer Logo"
          className="mx-auto mb-2 w-32 h-32 object-contain"
        />
        <div className="text-base font-semibold text-gray-800">树礼书院足球队</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`w-full text-left px-4 py-2 rounded-md font-medium transition-all
              ${page === key
                ? 'bg-yellow-100 scale-[1.03] shadow-md'
                : 'bg-yellow-50 hover:bg-yellow-100 hover:scale-[1.02]'}
              text-black`}
          >
            {label}
          </button>
        ))}
      </nav>

      <footer className="text-xs text-black text-center py-4 border-t border-blue-100">
        © 2025 Shuli Soccer
      </footer>
    </aside>
  )
}
