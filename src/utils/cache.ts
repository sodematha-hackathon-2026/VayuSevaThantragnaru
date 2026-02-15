export const HOME_CACHE_KEYS = {
  news: "home_cache_news",
  announcements: "home_cache_announcements",
};

type TimestampLike = {
  toMillis?: () => number;
};

export const serializeTimestamp = (value?: TimestampLike | number | null) => {
  if (typeof value === "number") return value;
  if (value?.toMillis) return value.toMillis();
  return undefined;
};
