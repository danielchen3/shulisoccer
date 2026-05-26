import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { PageHero } from "./shared/PageHero";
import { getBaseUrl } from "../utils/baseUrl";

const PHOTO_COUNT = 18;

export function TeamMoments() {
  const base = getBaseUrl();
  const thumbs = Array.from(
    { length: PHOTO_COUNT },
    (_, i) => `${base}assets/photo/thumbs/${i + 1}.webp`
  );
  const fullImages = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
    src: `${base}assets/photo/full/${i + 1}.jpg`,
  }));

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="Team Moments"
        subtitle="赛场内外，每一个值得铭记的瞬间。"
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {thumbs.map((thumb, idx) => (
            <button
              key={thumb}
              onClick={() => {
                setIndex(idx);
                setOpen(true);
              }}
              className="group relative aspect-square overflow-hidden bg-paper-2"
            >
              <img
                src={thumb}
                alt={`Moment ${idx + 1}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-end justify-between p-3">
                <span className="font-display text-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  0{idx + 1 < 10 ? idx + 1 : ""}{idx + 1 >= 10 ? idx + 1 : ""}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

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
