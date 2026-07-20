import {
  CompanyData,
  CompanyFinancialSnapshot,
  CompanyNewsArticle,
} from './dataService';

export const SYSTEM_INSTRUCTION = `You are a senior investment analyst at a consulting firm. You evaluate companies for potential investment using database financials and recent news signals.

Rules you always follow:
- Output clean, valid GitHub-flavored Markdown only - no commentary before or after it, no markdown code fences wrapping the whole response.
- Never invent numbers, dates, or events that are not present in the data you're given. If something is missing, say so instead of guessing.
- Financials and news can agree or conflict. When they conflict, or when data is missing, explain the uncertainty clearly rather than forcing a confident call.
- The recommendation must always be exactly one of: Invest, Don't Invest, or Defer.`;

const formatFinancialHistory = (history: CompanyFinancialSnapshot[]): string =>
  history.length
    ? history
        .map(
          (h) =>
            `- ${h.year}: Sales $${h.sales.toLocaleString()}, Profit $${h.profit.toLocaleString()}`
        )
        .join('\n')
    : '- No financial records were found in the database for this company.';

const formatNews = (news: CompanyNewsArticle | null): string =>
  news
    ? `Headline: "${news.heading}"\nDetails: ${news.content}`
    : 'No recent news article was available for this company.';

const renderDataBlock = (data: CompanyData): string => `Company: ${data.companyName} (ID: ${data.companyId})

DATABASE FINANCIALS (most recent year first):
${formatFinancialHistory(data.financialHistory)}

NEWS ARTICLE:
${formatNews(data.news)}`;

export const buildHighLevelPrompt = (data: CompanyData): string => `${renderDataBlock(data)}

TASK:
Reason privately about whether the sales trend, profit trend, and news sentiment agree or conflict - do not show that reasoning in the output.

Then output ONLY this Markdown, nothing else:

# ${data.companyName} — Investment Snapshot

**Recommendation:** <Invest | Don't Invest | Defer>

<One or two sentences justifying the call, naming the single strongest signal from the data above. If the financials and news disagree, say so explicitly instead of silently picking a side.>`;

export const buildDetailedPrompt = (data: CompanyData): string => `${renderDataBlock(data)}

TASK:
Combine both sources and reason about whether they reinforce or contradict each other. For example:
- Good sales + good profit + good news → Invest
- Good sales + good profit + bad news → Don't Invest / Defer
- Conflicting or missing data → explain the uncertainty clearly instead of forcing a confident call

Output ONLY this Markdown structure, nothing before or after it, and no extra top-level headings beyond these:

# ${data.companyName} — Investment Report

## Executive Summary
<2-4 sentences giving the bottom line up front.>

## Sales & Profit Snapshot
<Summarize the trend across the available years (growth/decline, magnitude), then present the figures as a Markdown table with columns Year | Sales | Profit.>

## News Analysis
<Summarize the article's headline and content, and what it signals (positive/negative/neutral) about near-term performance. If no article was available, state that explicitly.>

## Final Recommendation
**Recommendation:** <Invest | Don't Invest | Defer>

<Justify the call by explicitly connecting the financial trend to the news signal. If they conflict, explain the tension and why you're leaning invest/defer/don't invest rather than silently picking one.>`;

export type ReportPromptType = 'high-level' | 'detailed';

export const buildReportPrompt = (
  data: CompanyData,
  reportType: ReportPromptType
): string =>
  reportType === 'high-level'
    ? buildHighLevelPrompt(data)
    : buildDetailedPrompt(data);
