type SidebarProps = {
  setPage: (p: string) => void
  page: string
}

export function Sidebar({ setPage, page }: SidebarProps) {
  const items = [
    { label: '🏠 News', key: 'news' },
    { label: '👥 Players', key: 'players' },
    { label: '🥅 Top Scorers', key: 'scorers' },
    { label: '📊 Match Stats', key: 'matches' },
    { label: '💬 Forum', key: 'forum' },
  ]

  return (
    <aside className="w-[220px] max-w-[25%] min-w-[180px] bg-blue-800 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700 text-center">
        <h1 className="text-2xl font-bold">Shuli Soccer</h1>
        <p className="text-sm text-blue-200">树礼书院足球队官方平台</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`w-full text-left px-4 py-2 rounded-md font-medium transition-all
              ${page === key
                ? 'bg-blue-600 scale-[1.03] shadow-md'
                : 'hover:bg-blue-700 hover:scale-[1.02]'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <footer className="text-xs text-blue-300 text-center py-4 border-t border-blue-700">
        © 2025 Shuli Soccer
      </footer>
    </aside>
  )
}
