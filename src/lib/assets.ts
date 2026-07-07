const rawAssetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL?.trim() || "";
const assetBaseUrl = rawAssetBaseUrl.replace(/\/+$/, "");

export function assetUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return assetBaseUrl ? `${assetBaseUrl}${normalizedPath}` : normalizedPath;
}
