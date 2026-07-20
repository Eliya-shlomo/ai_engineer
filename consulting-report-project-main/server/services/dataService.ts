import { SalesforceData } from '../models';

const NEWS_API_URL = 'https://news-api.jona-581.workers.dev';
const NEWS_API_TIMEOUT_MS = 8000;

export interface CompanyFinancialSnapshot {
  companyId: string;
  companyName: string;
  year: number;
  sales: number;
  profit: number;
}

export interface CompanyNewsArticle {
  heading: string;
  content: string;
}

export interface CompanyData {
  companyId: string;
  companyName: string;
  /** Most recent year's DB figures - null if the company has no DB records */
  financials: CompanyFinancialSnapshot | null;
  /** All DB years for the company, newest first - useful for trend context */
  financialHistory: CompanyFinancialSnapshot[];
  /** Latest news article for the company - null if the API had nothing / failed */
  news: CompanyNewsArticle | null;
}

const toSnapshot = (row: SalesforceData): CompanyFinancialSnapshot => ({
  companyId: row.companyId,
  companyName: row.companyName,
  year: row.year,
  sales: Number(row.sales),
  profit: Number(row.profit),
});

/**
 * Fetches every DB row for a company, newest year first. The DB holds one row
 * per (company, year), so "last year's data" isn't a single row lookup - it's
 * whichever row has the highest year for that company.
 */
export const fetchFinancialHistory = async (
  companyId: string
): Promise<CompanyFinancialSnapshot[]> => {
  const rows = await SalesforceData.findAll({
    where: { companyId },
    order: [['year', 'DESC']],
  });

  return rows.map(toSnapshot);
};

export const fetchLatestFinancials = async (
  companyId: string
): Promise<CompanyFinancialSnapshot | null> => {
  const [latest] = await fetchFinancialHistory(companyId);
  return latest ?? null;
};

/**
 * The news API returns a single random article per call (heading + content).
 * It never includes structured sales/profit figures in practice, so this
 * only ever surfaces qualitative signal - not a numeric override of the DB.
 */
export const fetchCompanyNews = async (
  companyId: string
): Promise<CompanyNewsArticle | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NEWS_API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(
      `${NEWS_API_URL}/?id=${encodeURIComponent(companyId)}`,
      { signal: controller.signal }
    );
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(
        `News API request timed out after ${NEWS_API_TIMEOUT_MS}ms`
      );
    }
    throw new Error(
      `News API request failed: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`News API request failed with status ${response.status}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('News API returned a response that was not valid JSON');
  }

  const heading = (data as Record<string, unknown> | null)?.heading;
  const content = (data as Record<string, unknown> | null)?.content;

  if (typeof heading !== 'string' || typeof content !== 'string' || !heading || !content) {
    return null;
  }

  return { heading, content };
};

/**
 * Fetches both sources in parallel and reconciles them into one payload:
 * DB rows are compared by year to pick the most recent financial snapshot,
 * and it's paired with whatever news came back. The news fetch is isolated
 * so an API outage doesn't block the (more reliable) DB data.
 */
export const fetchCompanyData = async (
  companyId: string,
  companyName: string
): Promise<CompanyData> => {
  const financialHistoryPromise = fetchFinancialHistory(companyId).catch(
    (error) => {
      console.error(
        `Failed to fetch DB financials for company ${companyId}:`,
        error
      );
      throw new Error(`Unable to load financial data for company ${companyId}`);
    }
  );

  const newsPromise = fetchCompanyNews(companyId).catch((error) => {
    console.error(`Failed to fetch news for company ${companyId}:`, error);
    return null;
  });

  const [financialHistory, news] = await Promise.all([
    financialHistoryPromise,
    newsPromise,
  ]);

  const financials = financialHistory[0] ?? null;

  return {
    companyId,
    companyName: financials?.companyName ?? companyName,
    financials,
    financialHistory,
    news,
  };
};
