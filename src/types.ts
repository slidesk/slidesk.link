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
