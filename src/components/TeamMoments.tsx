import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { PageHero } from "./shared/PageHero";
import { getBaseUrl } from "../utils/baseUrl";

const NUMBERED = Array.from({ length: 18 }, (_, i) => ({
  thumb: `${i + 1}.webp`,
  full: `${i + 1}.jpg`,
}));

const HASH_NAMES = [
  "0c8097b65e2109ca09a04e4b1d57291e",
  "171bdfa286c69d719d4de71a8b5d9980",
  "2d709f240b2d3e50070ff6c7767f6bd7",
  "3070c39136b814de34b029dd17281908",
  "30f3ac4f8eccfd81be7b9ec68b3c3599",
  "45ae3937aff6c039d114c85c82dfe0fc",
  "53ec2abcd37ebfb491a70c7de27fc261",
  "56760b1148eed6bb7e5753400058eaa8",
  "5c17d0093149f0b9590f00868c5d60ef",
  "60092d30b8b5c2d98e8bf8b93a1f9ab1",
  "62b67219b2a921067234648190383f99",
  "6c6ee54c2b792d0c5bb9594e652bb668",
  "6e0ac058c426b9bb77339225621c57aa",
  "70223365caed9a984d32890f2bbea7d5",
  "7466f4f16652c65ce3ef7366fa8cc2b1",
  "810d5942236130402f7332e91ef8491a",
  "9ca360e2a7f2ce007b08808aa3996618",
  "a6ffd50c56339447459a852333545f3e",
  "a713bf67fce3e2bd08868ec6a4b8b7ae",
  "aa6c5efdc6f24fc424ff20108c1e92fd",
  "b8aaaf01c1f1b71a8c52a46d8d8d9834",
  "b8b3484d2e8e6028f142a5d613bef85c",
  "e078ebb53992277e59980ac997e360eb",
  "e1e474faca5f5d42845fb68ecbfd9a5a",
  "e5f7f70f11287ac63a0885e964834ffd",
  "f55b559fab34c24825fb1f77334d608c",
  "f8127cd0b48e92a09faaa2af08aa8207",
];

const HASHED = HASH_NAMES.map((h) => ({ thumb: `${h}.webp`, full: `${h}.jpg` }));

const PHOTOS = [...NUMBERED, ...HASHED];

export function TeamMoments() {
  const base = getBaseUrl();
  const thumbs = PHOTOS.map((p) => `${base}assets/photo/thumbs/${p.thumb}`);
  const fullImages = PHOTOS.map((p) => ({ src: `${base}assets/photo/full/${p.full}` }));

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
                  {String(idx + 1).padStart(2, "0")}
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
