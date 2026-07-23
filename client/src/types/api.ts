export type AddonKind = "plugin" | "component" | "theme" | "template";

/** Session status codes as used across the app. */
export const STATUS = {
  rejected: 0,
  accepted: 1,
  declined: 2,
  pending: 3,
} as const;

// ---- POST /search/:search/:kinds ----
export interface SearchAddon {
  slug: string;
  downloaded: number;
  description: string; // server-rendered, sanitized markdown HTML
  user: string; // user slug
}
export interface SearchUser {
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio: string; // HTML
}
export interface SearchSession {
  date: string;
  location: string;
  url: string | null;
  slides: string | null;
  video: string | null;
}
export interface SearchTalk {
  title: string;
  abstract: string; // HTML
  user: string;
  sessions: SearchSession[];
}
export interface SearchResponse {
  plugins: SearchAddon[];
  components: SearchAddon[];
  users: SearchUser[];
  talks: SearchTalk[];
  themes: SearchAddon[];
  templates: SearchAddon[];
}
export type SearchKind = keyof SearchResponse;

// ---- GET /api/users ----
export interface UserListItem {
  name: string;
  slug: string;
  avatarUrl: string | null;
  url: string | null;
  bioHtml: string; // server-rendered, sanitized markdown HTML
}

// ---- GET /api/me ----
export interface Me {
  slug: string;
  name: string | null;
  avatarUrl: string | null;
}

// ---- GET /profile/data ----
export interface ProfileForm {
  name: string | null;
  slug: string;
  avatarUrl: string | null;
  url: string | null;
  bio: string | null;
}
export interface HostedPresentation {
  id: string;
  userId: number;
  createdAt: string;
}
export interface ProfileSession {
  id: number;
  presentationId: number;
  location: string;
  slides: string | null;
  url: string | null;
  video: string | null;
  status: number;
  date: string;
}
export interface ProfilePresentation {
  id: number;
  title: string;
  abstract: string | null;
  url: string | null;
  Session: ProfileSession[];
}
export interface ProfileAddon {
  slug: string;
  downloaded: number;
  tags: string;
  description: string;
}
export interface ProfileData {
  form: ProfileForm;
  hosted: HostedPresentation[];
  presentations: ProfilePresentation[];
  plugins: ProfileAddon[];
  components: ProfileAddon[];
  templates: ProfileAddon[];
  themes: ProfileAddon[];
  token: string | null;
}
export interface ProfileUpdate {
  name: string;
  slug: string;
  avatarUrl: string;
  url: string;
  bio: string;
}

// ---- GET /api/user/:slug ----
export interface UserTalkSession {
  date: string;
  location: string;
  url: string | null;
  slides: string | null;
  video: string | null;
  status: number;
  presentationId: number;
}
export interface UserTalk {
  id: number;
  title: string;
  abstractHtml: string;
  sessions: UserTalkSession[];
}
export interface UserAddon {
  slug: string;
  downloaded: number;
  descriptionHtml: string;
}
export interface UserThemeAddon extends UserAddon {
  previews: string[]; // base64 webp
}
export interface UserPageData {
  name: string;
  slug: string;
  avatarUrl: string | null;
  url: string | null;
  bioHtml: string;
  talks: UserTalk[];
  plugins: UserAddon[];
  components: UserAddon[];
  templates: UserAddon[];
  themes: UserThemeAddon[];
}
