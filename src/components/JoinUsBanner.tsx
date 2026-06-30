import { useState } from "react";
import { getBaseUrl } from "../utils/baseUrl";

const CONTACTS = [
  { role: "队长", realName: "沈泓立", wechat: "hlshen19" },
  { role: "副队长", realName: "郑袭明", wechat: "ximing0428" },
  { role: "副队长", realName: "马麓原", wechat: "sanbao13666" },
];

export function JoinUsBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("joinUsBannerDismissed") === "1"
  );
  const [showQR, setShowQR] = useState(false);
  const base = getBaseUrl();

  if (dismissed) return null;

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-40 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
        <div className="relative w-full max-w-sm sm:w-80">
          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="group flex w-full items-center justify-between gap-4 rounded-lg bg-brand-500 px-5 py-4 text-left text-ink shadow-2xl ring-2 ring-ink/10 transition-all hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
          >
            <span className="min-w-0">
              <span className="block font-display text-3xl uppercase leading-none tracking-wide">
                Join Us
              </span>
              <span className="mt-1 block text-sm font-semibold leading-tight">
                加入树礼足球队
              </span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-2xl font-bold leading-none text-white transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              localStorage.setItem("joinUsBannerDismissed", "1");
            }}
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xl leading-none text-white shadow-lg transition-colors hover:bg-ink-soft"
            aria-label="Dismiss Join Us"
          >
            ×
          </button>
        </div>
      </div>

      {showQR && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-72 p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl uppercase text-center">
              加入树礼足球队
            </h3>
            <img
              src={`${base}assets/news/recruitment-group.jpg`}
              alt="招新群二维码"
              className="w-48 mx-auto rounded-lg"
            />
            <div className="space-y-1.5 text-sm">
              {CONTACTS.map((c) => (
                <div key={c.realName} className="flex items-center justify-between">
                  <span className="text-gray-500">{c.role} {c.realName}</span>
                  <span className="text-right">
                    <span className="text-[10px] text-gray-400">微信号 </span>
                    <span className="font-mono font-bold text-xs">{c.wechat}</span>
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-brand-500 hover:bg-brand-400 text-ink font-bold uppercase tracking-wider text-sm py-2 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
