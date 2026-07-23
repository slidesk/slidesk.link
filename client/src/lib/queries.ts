import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ADDON_META } from "@/lib/addon-meta";
import { ApiError, api } from "@/lib/api";
import type { AddonKind, ProfileUpdate, SearchKind } from "@/types/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.me().catch(() => null),
    staleTime: 60_000,
  });
}

/** All addons of one kind (listing pages), via the wildcard search. */
export function useAddons(kind: AddonKind) {
  const plural = ADDON_META[kind].plural;
  return useQuery({
    queryKey: ["addons", kind],
    queryFn: () => api.search("*", [plural]),
  });
}

export function useSearch(term: string, kinds: SearchKind[]) {
  const enabled = term.trim().length >= 3 && kinds.length > 0;
  return useQuery({
    queryKey: [
      "search",
      term.trim().toLowerCase(),
      [...kinds].sort().join(","),
    ],
    queryFn: () => api.search(term, kinds),
    enabled,
  });
}

export function useUserPage(slug: string) {
  return useQuery({
    queryKey: ["user", slug],
    queryFn: () => api.userPage(slug),
    retry: (count, err) =>
      err instanceof ApiError && err.status === 404 ? false : count < 1,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile(),
    retry: (count, err) =>
      err instanceof ApiError && err.status === 401 ? false : count < 1,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: ProfileUpdate) => api.saveProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useDeleteProfileItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: Parameters<typeof api.deleteProfileItem>[0];
      id: string | number;
    }) => api.deleteProfileItem(type, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
