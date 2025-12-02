import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getBaseUrl } from '../utils/baseUrl';

export function TeamMoments() {
  const base = getBaseUrl();
  const photoCount = 18;

  const thumbs = Array.from({ length: photoCount }, (_, i) => `${base}assets/photo/thumbs/${i + 1}.webp`);
  const fullImages = Array.from({ length: photoCount }, (_, i) => ({
    src: `${base}assets/photo/full/${i + 1}.jpg`
  }));

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">精彩瞬间</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {thumbs.map((thumb, idx) => (
          <img
            key={thumb}
            src={thumb}
            alt={`精彩瞬间${idx + 1}`}
            className="w-full h-64 object-cover rounded-lg shadow transform transition-transform duration-300 hover:scale-115 cursor-pointer"
            loading="lazy"
            onClick={() => {
              setIndex(idx);
              setOpen(true);
            }}
          />
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={fullImages}
        index={index}
        on={{ view: ({ index }) => setIndex(index) }}
      />
    </div>
  );
}
