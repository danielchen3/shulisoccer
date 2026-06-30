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
      <div className="bg-brand-500 text-ink text-xs sm:text-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-between gap-4">
          <button
            onClick={() => setShowQR(true)}
            className="font-bold uppercase tracking-wider hover:underline shrink-0"
          >
            Join Us →
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              localStorage.setItem("joinUsBannerDismissed", "1");
            }}
            className="shrink-0 hover:text-ink/60 transition-colors text-lg leading-none"
            aria-label="Dismiss"
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
