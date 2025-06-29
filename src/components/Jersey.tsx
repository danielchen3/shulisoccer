export function Jersey() {
  const base = import.meta.env.BASE_URL || '/';
  // 直接使用真实文件名
  const jerseyFiles = [
    "主场.jpg",
    "客场.jpg",
    "守门员主场.jpg",
    "守门员客场.jpg",
  ];
  const jerseys = jerseyFiles.map(name => ({
    src: `${base}assets/Jersey/${name}`,
    name: name.replace(/\.jpg$/i, ""),
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">球衣展示</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {jerseys.map((jersey, idx) => (
          <div key={jersey.src} className="flex flex-col items-center">
            <img
              src={jersey.src}
              alt={`球衣${idx + 1}`}
              className="h-96 w-40 object-cover rounded-lg shadow bg-white"
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
            <div className="mt-2 text-gray-700 text-base">{jersey.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}