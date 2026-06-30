import { useState } from "react";
import { getBaseUrl } from "../utils/baseUrl";

const TEAM_INTRO_IMAGE = "assets/photo/full/0c8097b65e2109ca09a04e4b1d57291e.jpg";

const TEAM_INTRO = {
  zh: {
    label: "中文版",
    eyebrow: "中文",
    summary: "成立十年，树礼足球队始终在向队史第一座书院杯冠军靠近。",
    paragraphs: [
      "树礼书院足球队随书院成立于2016年。建队以来，球队长期保持书院杯小组出线水准，培养了李恩（前书院杯历史射手王、南科大校队前队长）、彭奕豪、吴嘉木等知名球员。",
      "自2023年起，树礼足球队逐渐迈入南科大第一梯队，先后获得2024书院杯亚军、2025书院杯季军、2025新生杯冠军、2026书院杯亚军。",
      "同时，目前树礼足球队为校队提供了最多的现役球员，包括沈泓立、郑袭明、庞宇程、张涵、邱彦鸣、张熙泰、戴铭希、贺梓尧、马麓原。",
      "由于书院成立时间较短，球队的冠军底蕴仍在沉淀。近年来，球队持续完善赛前、赛中、赛后的准备与宣传流程，包括赛前海报宣发、赛中摄影录像记录、赛后集锦制作，并运营球队网站、公众号、视频号、B站账号等全媒体平台。",
      "成立十年，球队离冠军越来越近。希望你的加入，可以为树礼足球队、树礼书院带来队史第一座书院杯冠军！",
    ],
  },
  en: {
    label: "English",
    eyebrow: "English",
    summary:
      "Ten years after its founding, Shuli FC is still moving closer to the first College Cup title in team history.",
    paragraphs: [
      "Founded alongside Shuli College in 2016, Shuli FC has been a consistent qualifier for the knockout stage of the College Cup since its early years. The team has produced standout players including Li En, the former all-time College Cup top scorer and former captain of the SUSTech varsity team, as well as Peng Yihao and Wu Jiamu.",
      "Since 2023, Shuli FC has gradually risen into SUSTech's top tier, finishing as runner-up in the 2024 College Cup, third place in the 2025 College Cup, champion of the 2025 Freshman Cup, and runner-up again in the 2026 College Cup.",
      "Shuli FC currently contributes the largest number of active players to the SUSTech varsity team, including Shen Hongli, Zheng Ximing, Pang Yucheng, Zhang Han, Qiu Yanming, Zhang Xitai, Dai Mingxi, He Ziyao, and Ma Luyuan.",
      "As a relatively young college team, Shuli FC is still building its championship legacy. In recent years, the team has refined its matchday preparation and media workflow, from pre-match poster promotion to in-game photography and video coverage, post-match highlight production, and the operation of its website, WeChat Official Account, Channels account, and Bilibili platform.",
      "With your arrival, we hope to bring the first College Cup championship in team history to Shuli FC and Shuli College.",
    ],
  },
};

type Language = keyof typeof TEAM_INTRO;

export function TeamIntro() {
  const base = getBaseUrl();
  const [language, setLanguage] = useState<Language>("zh");
  const intro = TEAM_INTRO[language];

  return (
    <section className="bg-paper border-y border-black/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr] gap-10 lg:gap-16 items-start">
          <aside className="lg:sticky lg:top-24">
            <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              ▍ About Shuli FC
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase leading-none">
              Team
              <br />
              Introduction
            </h2>
            <p className="mt-6 max-w-md border-l-4 border-brand-500 pl-4 text-lg sm:text-xl font-semibold leading-8 text-ink">
              {intro.summary}
            </p>
          </aside>

          <div className="relative overflow-hidden bg-white border border-black/5 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <img
              src={`${base}${TEAM_INTRO_IMAGE}`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-55 contrast-110 saturate-115"
            />
            <div className="absolute inset-0 bg-white/50" />

            <div className="relative mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-px w-12 bg-black/10 sm:w-20" />
                <h3 className="font-display text-2xl uppercase">{intro.label}</h3>
              </div>

              <div className="inline-grid h-10 grid-cols-2 rounded-full border border-black/10 bg-paper-2 p-1">
                {(["zh", "en"] as const).map((item) => {
                  const active = language === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      className={[
                        "min-w-24 rounded-full px-4 text-xs font-bold uppercase tracking-[0.16em] transition-colors",
                        active
                          ? "bg-ink text-white shadow-sm"
                          : "text-gray-500 hover:text-ink",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      {TEAM_INTRO[item].eyebrow}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative space-y-5">
              {intro.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={[
                    "border-b border-black/10 pb-5 text-base sm:text-lg leading-8 text-gray-700 last:border-b-0 last:pb-0",
                    index === intro.paragraphs.length - 1
                      ? "font-semibold text-ink"
                      : "",
                  ].join(" ")}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
