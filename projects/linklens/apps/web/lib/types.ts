export type Device = "Desktop" | "Mobile" | "Tablet";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface LinkView {
  id: string;
  code: string;
  url: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
}

export interface Analytics {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  byDay: { date: string; clicks: number }[];
  byDevice: Record<Device, number>;
  topReferrers: { name: string; clicks: number }[];
  topLinks: { code: string; url: string; clicks: number }[];
}
