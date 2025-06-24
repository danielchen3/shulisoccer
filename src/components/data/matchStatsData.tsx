export interface MatchEvent {
  round: string;
  left: string;
  score: string;
  right: string;
  video?: { label: string; url: string };
}

export interface MatchGroup {
  year: string;
  medal?: string;
  video?: { label: string; url: string };
  events: MatchEvent[];
}

export const matchStatsData: MatchGroup[] = [
  {
    year: "2025书院杯",
    medal: "🥉",
    video: { label: "进球集锦", url: "https://www.bilibili.com/video/BV1mXJnzKE3w/?spm_id_from=333.1387.list.card_archive.click&vd_source=3ee4b895362d07bcf970153c86744de8" },
    events: [
      { round: "三四名决赛", left: "树礼书院", score: "3 : 0", right: "致仁书院" },
      { round: "半决赛", left: "树礼书院", score: "1 : 3", right: "树仁书院" },
      { round: "小组赛第二轮", left: "树礼书院", score: "1 : 3", right: "致诚书院", video: { label: "全场集锦", url: "https://www.bilibili.com/video/BV1WBjczPEJS/?spm_id_from=333.1387.list.card_archive.click&vd_source=3ee4b895362d07bcf970153c86744de8" } },
      { round: "小组赛第一轮", left: "树礼书院", score: "3 : 0", right: "致新书院", video: { label: "全场集锦", url: "https://www.bilibili.com/video/BV1keXbYoEyd/?spm_id_from=333.1387.list.card_archive.click&vd_source=3ee4b895362d07bcf970153c86744de8" } },
    ],
  },
  {
    year: "2024书院杯",
    medal: "🥈",
    video: { label: "进球集锦", url: "https://www.bilibili.com/video/BV1NT421q7cS/?spm_id_from=333.1387.list.card_archive.click&vd_source=3ee4b895362d07bcf970153c86744de8" },
    events: [
      { round: "决赛", left: "树礼书院", score: "0 : 3", right: "致诚书院" },
      { round: "半决赛", left: "树礼书院", score: "1 : 1 (4:3)", right: "树仁书院" },
      { round: "小组赛第二轮", left: "树礼书院", score: "2 : 0", right: "树德书院" },
      { round: "小组赛第一轮", left: "树礼书院", score: "3 : 2", right: "致仁书院" },
    ],
  },
];
