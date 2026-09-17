import { ALL_OFFICES_VALUE, OFFICE_PARAM, OFFICE_STORAGE_KEY } from "../constants";

export function initialOfficeId(): string {
  if (typeof window === "undefined") return ALL_OFFICES_VALUE;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get(OFFICE_PARAM);
  if (fromUrl !== null) return fromUrl;
  return window.localStorage.getItem(OFFICE_STORAGE_KEY) ?? ALL_OFFICES_VALUE;
}

export function updateSearchParams(update: (params: URLSearchParams) => void) {
  const params = new URLSearchParams(window.location.search);
  update(params);
  const search = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
}
