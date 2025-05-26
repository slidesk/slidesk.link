export type SlideskLinkUser = {
  id: number | undefined;
  slug: string;
  name: string | null;
  bio: string | null;
  url: string | null;
  avatarUrl: string | null;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  githubId: number | null;
};

export type SlideskLinkSession = {
  id: number;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
  presentationId: number;
  location: string;
  slides: string | null;
  video: string | null;
  status: number;
  date: Date;
};
