import type {
  Me,
  ProfileData,
  ProfileUpdate,
  SearchKind,
  SearchResponse,
  UserListItem,
  UserPageData,
} from "@/types/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

const opts: RequestInit = { credentials: "same-origin" };

export const api = {
  async me(): Promise<Me> {
    return json<Me>(await fetch("/api/me", opts));
  },

  async search(term: string, kinds: SearchKind[]): Promise<SearchResponse> {
    const q = term.trim() === "" ? "*" : encodeURIComponent(term);
    return json<SearchResponse>(
      await fetch(`/search/${q}/${kinds.join(",")}`, {
        ...opts,
        method: "POST",
      }),
    );
  },

  async users(): Promise<UserListItem[]> {
    return json<UserListItem[]>(await fetch("/api/users", opts));
  },

  async userPage(slug: string): Promise<UserPageData> {
    return json<UserPageData>(
      await fetch(`/api/user/${encodeURIComponent(slug)}`, opts),
    );
  },

  async profile(): Promise<ProfileData> {
    return json<ProfileData>(await fetch(`/profile/data?${Date.now()}`, opts));
  },

  async saveProfile(form: ProfileUpdate): Promise<void> {
    const body = new URLSearchParams(form as unknown as Record<string, string>);
    const res = await fetch("/profile", { ...opts, method: "POST", body });
    if (!res.ok && res.status !== 302) {
      throw new ApiError(res.status, await res.text());
    }
  },

  async deleteProfileItem(
    type:
      | "presentation"
      | "session"
      | "hosted"
      | "plugin"
      | "component"
      | "template"
      | "theme",
    id: string | number,
  ): Promise<void> {
    const res = await fetch(`/profile/${type}/${id}`, {
      ...opts,
      method: "DELETE",
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
  },

  async deleteAccount(): Promise<void> {
    await fetch("/profile/user", { ...opts, method: "DELETE" });
  },
};

export { ApiError };
