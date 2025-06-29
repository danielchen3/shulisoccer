export interface NewsItem {
  date: string;
  content: string;
  image?: string;
}

const base = import.meta.env.BASE_URL || '/';

export const newsList: NewsItem[] = [
  {
    date: "2025/5/17",
    content: "树礼书院夺得24-25赛季书院杯季军并举行21级球员告别仪式",
  },
  {
    date: "2025/6/29",
    content: "🌟🌟树礼书院2025级新生招募🌟🌟 (招新qq群号:1050865221)",
    image: `${base}assets/recruitment.jpg`,
  },
];
