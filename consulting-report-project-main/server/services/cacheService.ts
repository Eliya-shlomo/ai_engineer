/**
 * In-memory cache for generated reports, keyed on whatever inputs made the
 * LLM call deterministic (company, report type, and the news article seen).
 * The news API repeats stale articles alongside fresh ones - when we get an
 * article we've already scored, there's no need to burn LLM tokens again.
 */
const reportCache = new Map<string, string>();

export const buildReportCacheKey = (
  companyId: string,
  reportType: string,
  newsHeading: string | null
): string => `${companyId}::${reportType}::${newsHeading ?? 'no-news'}`;

export const getCachedReport = (key: string): string | undefined =>
  reportCache.get(key);

export const setCachedReport = (key: string, markdown: string): void => {
  reportCache.set(key, markdown);
};
