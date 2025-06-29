export function TeamMoments() {
  const base = import.meta.env.BASE_URL || '/';
  const photoCount = 18;
  const photos = Array.from({ length: photoCount }, (_, i) => `${base}assets/photo/${i + 1}.jpg`);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">精彩瞬间</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={`精彩瞬间${idx + 1}`}
            className="w-full h-64 object-cover rounded-lg shadow"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}