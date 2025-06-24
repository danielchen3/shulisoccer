import { useNavigate, useLocation } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const base = import.meta.env.BASE_URL || '/';

  const items = [
    { label: '🏠 News', path: '/' },
    { label: '👥 Players', path: '/players' },
    { label: '🎖️ Retired Players', path: '/retired_players' },
    { label: '🥅 Top Scorers', path: '/scorers' },
    { label: '📊 Match Stats', path: '/matches' },
    { label: '💬 Forum', path: '/forum' },
  ];

  return (
    <aside className="w-[230px] max-w-[25%] min-w-[180px] bg-white text-black flex flex-col">
      <div className="p-6 border-b border-blue-100 text-center">
        <img
          src={`${base}assets/logo.jpg`}
          alt="Shuli Soccer Logo"
          className="mx-auto mb-2 w-32 h-32 object-contain"
        />
        <div className="text-base font-semibold text-gray-800">树礼书院足球队</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map(item => (
          <div
            key={item.path}
            className={`cursor-pointer px-5 py-3 rounded-md font-medium transition-all
              ${location.pathname === item.path
                ? 'bg-yellow-100 scale-[1.06] shadow-md'
                : 'bg-yellow-0 hover:bg-yellow-100 hover:scale-[1.02]'}
              text-black`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
      </nav>

      <footer className="text-xs text-black text-center py-4 border-t border-blue-100">
        © 2025 Shuli Soccer
      </footer>
    </aside>
  )
}
